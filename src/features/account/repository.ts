import { asc, sql, eq, count } from "drizzle-orm";
import { db } from "@/db/client";
import { account, loanMovement } from "@/db/schema";
import type { Account, AccountPatch, NewAccount } from "./types";

export async function countAccounts(): Promise<number> {
  const [r] = await db.select({ n: count() }).from(account);
  return r.n;
}

export async function countLoans(): Promise<number> {
  const [r] = await db.select({ n: count() }).from(loanMovement);
  return r.n;
}

export async function insertAccount(values: NewAccount): Promise<Account> {
  const [row] = await db.insert(account).values(values).returning();
  return row;
}

export async function findAccountById(id: number): Promise<Account | null> {
  const [row] = await db.select().from(account).where(eq(account.id, id));
  return row ?? null;
}

export async function findAccountByUsername(
  username: string,
): Promise<Account | null> {
  const [row] = await db
    .select()
    .from(account)
    .where(sql`lower(${account.username}) = ${username.toLowerCase()}`);
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
  return db
    .select()
    .from(account)
    .orderBy(asc(sql`lower(${account.username})`), asc(account.id));
}
