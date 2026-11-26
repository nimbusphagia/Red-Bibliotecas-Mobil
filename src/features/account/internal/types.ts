import type { account, ACCOUNT_ROLES } from "@/db/schema";
export type AccountRole = (typeof ACCOUNT_ROLES)[number];
export type Account = typeof account.$inferSelect;
export type PublicAccount = Omit<Account, "passwordHash" | "recoveryHash">;
export type NewAccount = Pick<
  Account,
  "name" | "passwordHash" | "role" | "mustChangePassword" | "recoveryHash"
>;
export type AccountPatch = Partial<
  Pick<Account, "passwordHash" | "mustChangePassword" | "recoveryHash">
>;
