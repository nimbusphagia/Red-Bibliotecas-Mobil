import { ACCOUNT_ROLES } from "@/db/schema";
import { inTransaction } from "@/db/transaction";
import {
  ForbiddenError,
  InvalidCredentialsError,
  NotFoundError,
  SetupClosedError,
} from "@/features/shared/errors/errors";
import { idSchema } from "@/features/shared/types/schemas";
import {
  mapWriteErrors,
  parseOrThrow,
} from "@/features/shared/validation/validation";
import { hashPassword, verifyPassword } from "./password";
import { generateRecoveryCode, normalizeRecoveryCode } from "./recovery";
import * as repo from "./repository";
import {
  changeOwnPasswordSchema,
  completeSetupSchema,
  loginSchema,
  recoverAdminSchema,
  resetPasswordSchema,
  setInitialPasswordSchema,
} from "./schemas";
import { ACCOUNT_NAMES, INITIAL_PASSWORD, outranks } from "./setup";
import type { Account, AccountPatch, PublicAccount } from "./types";

const toPublic = ({
  passwordHash,
  recoveryHash,
  ...rest
}: Account): PublicAccount => rest;

const hashRecoveryCode = (code: string) =>
  hashPassword(normalizeRecoveryCode(code));

export async function isSetupOpen(): Promise<boolean> {
  return (await repo.countAccounts()) === 0 && (await repo.countLoans()) === 0;
}

async function findActor(actorId: number): Promise<Account> {
  const actor = await repo.findAccountById(parseOrThrow(idSchema, actorId));
  if (!actor) throw new ForbiddenError("use this account");
  return actor;
}

export async function requireAccount(actorId: number): Promise<Account> {
  const actor = await findActor(actorId);
  if (actor.mustChangePassword) throw new ForbiddenError("use this account");
  return actor;
}

async function save(id: number, patch: AccountPatch): Promise<PublicAccount> {
  const row = await repo.updateAccount(id, patch);
  if (!row) throw new NotFoundError("account", id);
  return toPublic(row);
}

export async function login(input: unknown): Promise<PublicAccount> {
  const { role, password } = parseOrThrow(loginSchema, input);

  const found = await repo.findAccountByRole(role);
  if (!found || !(await verifyPassword(password, found.passwordHash))) {
    throw new InvalidCredentialsError();
  }
  return toPublic(found);
}

export async function listLowerAccounts(
  actorId: number,
): Promise<PublicAccount[]> {
  const actor = await requireAccount(actorId);
  return (await repo.listAccounts())
    .filter((a) => outranks(actor.role, a.role))
    .sort(
      (a, b) => ACCOUNT_ROLES.indexOf(a.role) - ACCOUNT_ROLES.indexOf(b.role),
    )
    .map(toPublic);
}

export async function resetAccountPassword(
  actorId: number,
  input: unknown,
): Promise<PublicAccount> {
  const actor = await requireAccount(actorId);
  const { role } = parseOrThrow(resetPasswordSchema, input);
  if (!outranks(actor.role, role)) throw new ForbiddenError("reset account");

  const target = await repo.findAccountByRole(role);
  if (!target) throw new NotFoundError("account", role);
  return save(target.id, {
    passwordHash: await hashPassword(INITIAL_PASSWORD),
    mustChangePassword: true,
  });
}

export async function changeOwnPassword(
  actorId: number,
  input: unknown,
): Promise<void> {
  const actor = await requireAccount(actorId);
  const { currentPassword, newPassword } = parseOrThrow(
    changeOwnPasswordSchema,
    input,
  );

  if (!(await verifyPassword(currentPassword, actor.passwordHash))) {
    throw new InvalidCredentialsError();
  }
  await save(actor.id, { passwordHash: await hashPassword(newPassword) });
}

export async function setInitialPassword(
  actorId: number,
  input: unknown,
): Promise<PublicAccount> {
  const actor = await findActor(actorId);
  if (!actor.mustChangePassword) throw new ForbiddenError("skip password");
  const { newPassword } = parseOrThrow(setInitialPasswordSchema, input);

  return save(actor.id, {
    passwordHash: await hashPassword(newPassword),
    mustChangePassword: false,
  });
}

export async function getSessionAccount(
  id: number,
): Promise<PublicAccount | null> {
  const row = await repo.findAccountById(id);
  return row ? toPublic(row) : null;
}

/** Devuelve el código de recuperación del administrador; se muestra una sola vez. */
export async function completeSetup(input: unknown): Promise<string> {
  const { password } = parseOrThrow(completeSetupSchema, input);
  if (!(await isSetupOpen())) throw new SetupClosedError();

  const recoveryCode = generateRecoveryCode();
  const [adminHash, recoveryHash, initialHash] = await Promise.all([
    hashPassword(password),
    hashRecoveryCode(recoveryCode),
    hashPassword(INITIAL_PASSWORD),
  ]);

  await mapWriteErrors("account", async () =>
    inTransaction((tx) =>
      repo.insertAccountsSync(
        tx,
        ACCOUNT_ROLES.map((role) => {
          const admin = role === "admin";
          return {
            role,
            name: ACCOUNT_NAMES[role],
            passwordHash: admin ? adminHash : initialHash,
            mustChangePassword: !admin,
            recoveryHash: admin ? recoveryHash : null,
          };
        }),
      ),
    ),
  );
  return recoveryCode;
}

/** Cambia la contraseña del administrador y devuelve un código nuevo. */
export async function recoverAdmin(input: unknown): Promise<string> {
  const { code, password } = parseOrThrow(recoverAdminSchema, input);

  const admin = await repo.findAccountByRole("admin");
  if (
    !admin?.recoveryHash ||
    !(await verifyPassword(code, admin.recoveryHash))
  ) {
    throw new InvalidCredentialsError();
  }

  const recoveryCode = generateRecoveryCode();
  await save(admin.id, {
    passwordHash: await hashPassword(password),
    recoveryHash: await hashRecoveryCode(recoveryCode),
    mustChangePassword: false,
  });
  return recoveryCode;
}
