import { count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { account, loanMovement } from "@/db/schema";
import type { Account, AccountPatch, AccountRole, NewAccount } from "./types";
import type { Executor } from "@/db/transaction";

export async function countAccounts(): Promise<number> {
  const [r] = await db.select({ n: count() }).from(account);
  return r.n;
}

export async function countLoans(): Promise<number> {
  const [r] = await db.select({ n: count() }).from(loanMovement);
  return r.n;
}

export async function findAccountById(id: number): Promise<Account | null> {
  const [row] = await db.select().from(account).where(eq(account.id, id));
  return row ?? null;
}

export async function findAccountByRole(
  role: AccountRole,
): Promise<Account | null> {
  const [row] = await db.select().from(account).where(eq(account.role, role));
  return row ?? null;
}

export async function updateAccount(
  id: number,
  patch: AccountPatch,
): Promise<Account | null> {
  const [row] = await db
    .update(account)
    .set(patch)
    .where(eq(account.id, id))
    .returning();
  return row ?? null;
}

export async function listAccounts(): Promise<Account[]> {
  return db.select().from(account);
}

export function insertAccountsSync(
  ex: Executor,
  values: NewAccount[],
): Account[] {
  return ex.insert(account).values(values).returning().all();
}
