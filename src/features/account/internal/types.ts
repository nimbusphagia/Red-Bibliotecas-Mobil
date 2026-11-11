import type { account } from "@/db/schema";
export type Account = typeof account.$inferSelect;
export type PublicAccount = Omit<Account, "passwordHash">;
export type NewAccount = Pick<Account, "username" | "passwordHash" | "role">;
export type AccountPatch = Partial<
  Pick<Account, "role" | "active" | "passwordHash">
>;
