export function isUniqueViolation(error: unknown): boolean {
  let e: unknown = error;
  while (e) {
    if (e instanceof Error && /UNIQUE constraint failed/i.test(e.message))
      return true;
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}
