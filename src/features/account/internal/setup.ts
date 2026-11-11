export const INITIAL_PASSWORD = "library_password_123";

export const SEED_ACCOUNTS = [
  { username: "admin", role: "admin" },
  { username: "staff", role: "staff" },
] as const;

export const RESERVED_USERNAMES: ReadonlySet<string> = new Set(
  SEED_ACCOUNTS.map((a) => a.username),
);
