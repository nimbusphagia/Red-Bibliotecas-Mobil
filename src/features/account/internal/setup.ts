export const INITIAL_PASSWORD = "library_password_123";

export const SEED_ACCOUNTS = [
  { email: "admin@biblioteca.local", name: "Administrador", role: "admin" },
  { email: "staff@biblioteca.local", name: "Personal", role: "staff" },
] as const;

export const RESERVED_EMAILS: ReadonlySet<string> = new Set(
  SEED_ACCOUNTS.map((a) => a.email),
);
