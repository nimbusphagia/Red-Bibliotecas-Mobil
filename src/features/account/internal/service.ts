import {
  ForbiddenError,
  InvalidCredentialsError,
  NotFoundError,
  ProtectedError,
  SetupClosedError,
} from "@/errors/errors";
import { idSchema } from "@/shared/types/schemas";
import { mapWriteErrors, parseOrThrow } from "@/shared/validation/validation";
import { hashPassword, verifyPassword } from "./password";
import * as repo from "./repository";
import {
  changeOwnPasswordSchema,
  changeRoleSchema,
  createAccountSchema,
  loginSchema,
  resetPasswordSchema,
  setActiveSchema,
  completeSetupSchema,
} from "./schemas";
import type { Account, AccountPatch, PublicAccount } from "./types";
import { INITIAL_PASSWORD, SEED_ACCOUNTS } from "./setup";
import { inTransaction } from "@/db/transaction";

const toPublic = ({ passwordHash, ...rest }: Account): PublicAccount => rest;

export async function isSetupOpen(): Promise<boolean> {
  return (await repo.countAccounts()) === 0 && (await repo.countLoans()) === 0;
}

export async function requireActive(actorId: number): Promise<Account> {
  const actor = await repo.findAccountById(parseOrThrow(idSchema, actorId));
  if (!actor || !actor.active) throw new ForbiddenError("use this account");
  return actor;
}

async function requireOwner(actorId: number): Promise<Account> {
  const actor = await requireActive(actorId);
  if (actor.role !== "owner") throw new ForbiddenError("manage accounts");
  return actor;
}

export async function createAccount(
  actorId: number,
  input: unknown,
): Promise<PublicAccount> {
  await requireOwner(actorId);
  const { username, password, role } = parseOrThrow(createAccountSchema, input);

  const passwordHash = await hashPassword(password);
  const row = await mapWriteErrors("account", () =>
    repo.insertAccount({ username, passwordHash, role }),
  );
  return toPublic(row);
}

export async function login(input: unknown): Promise<PublicAccount> {
  const { username, password } = parseOrThrow(loginSchema, input);

  const found = await repo.findAccountByUsername(username);
  if (!found || !found.active) throw new InvalidCredentialsError();
  if (!(await verifyPassword(password, found.passwordHash))) {
    throw new InvalidCredentialsError();
  }
  return toPublic(found);
}

async function requireManageable(actorId: number, targetId: number) {
  await requireOwner(actorId);
  const id = parseOrThrow(idSchema, targetId);
  const target = await repo.findAccountById(id);
  if (!target) throw new NotFoundError("account", id);
  if (target.role === "owner") throw new ProtectedError("account", id);
  return target;
}

async function save(id: number, patch: AccountPatch): Promise<PublicAccount> {
  const row = await repo.updateAccount(id, patch);
  if (!row) throw new NotFoundError("account", id);
  return toPublic(row);
}

export async function setAccountActive(
  actorId: number,
  targetId: number,
  input: unknown,
) {
  const target = await requireManageable(actorId, targetId);
  const { active } = parseOrThrow(setActiveSchema, input);
  return save(target.id, { active });
}

export async function changeAccountRole(
  actorId: number,
  targetId: number,
  input: unknown,
) {
  const target = await requireManageable(actorId, targetId);
  const { role } = parseOrThrow(changeRoleSchema, input);
  return save(target.id, { role });
}

export async function resetAccountPassword(
  actorId: number,
  targetId: number,
  input: unknown,
) {
  const target = await requireManageable(actorId, targetId);
  const { password } = parseOrThrow(resetPasswordSchema, input);
  return save(target.id, { passwordHash: await hashPassword(password) });
}

export async function listAccounts(actorId: number): Promise<PublicAccount[]> {
  await requireOwner(actorId);
  return (await repo.listAccounts()).map(toPublic);
}

export async function changeOwnPassword(
  actorId: number,
  input: unknown,
): Promise<void> {
  const actor = await requireActive(actorId);
  const { currentPassword, newPassword } = parseOrThrow(
    changeOwnPasswordSchema,
    input,
  );

  if (!(await verifyPassword(currentPassword, actor.passwordHash))) {
    throw new InvalidCredentialsError();
  }
  await save(actor.id, { passwordHash: await hashPassword(newPassword) });
}

export async function getSessionAccount(
  id: number,
): Promise<PublicAccount | null> {
  const row = await repo.findAccountById(id);
  return row?.active ? toPublic(row) : null;
}

export async function completeSetup(input: unknown): Promise<PublicAccount> {
  const { username, password } = parseOrThrow(completeSetupSchema, input);
  if (!(await isSetupOpen())) throw new SetupClosedError();

  const [ownerHash, ...seedHashes] = await Promise.all([
    hashPassword(password),
    ...SEED_ACCOUNTS.map(() => hashPassword(INITIAL_PASSWORD)),
  ]);

  const rows = await mapWriteErrors("account", async () =>
    inTransaction((tx) =>
      repo.insertAccountsSync(tx, [
        { username, passwordHash: ownerHash, role: "owner" },
        ...SEED_ACCOUNTS.map((a, i) => ({
          username: a.username,
          passwordHash: seedHashes[i],
          role: a.role,
        })),
      ]),
    ),
  );
  return toPublic(rows[0]);
}
