import type { AccountRole } from "./types";

export const INITIAL_PASSWORD = "library_password_123";

export const ACCOUNT_NAMES: Record<AccountRole, string> = {
  admin: "Administrador",
  librarian: "Bibliotecario",
  staff: "Auxiliar",
};

const RANK: Record<AccountRole, number> = { admin: 2, librarian: 1, staff: 0 };

export const outranks = (actor: AccountRole, target: AccountRole) =>
  RANK[actor] > RANK[target];
