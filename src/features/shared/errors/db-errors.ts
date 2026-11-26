function messages(error: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<unknown>();
  let e: unknown = error;
  while (e && !seen.has(e)) {
    seen.add(e);
    if (e instanceof Error) out.push(e.message);
    e = (e as { cause?: unknown }).cause;
  }
  return out;
}

const UNIQUE = /UNIQUE constraint failed: ([^\n]+)/i;

export function isUniqueViolation(error: unknown): boolean {
  return messages(error).some((m) => UNIQUE.test(m));
}

export function uniqueViolationColumns(error: unknown): string[] {
  for (const m of messages(error)) {
    const hit = UNIQUE.exec(m);
    if (!hit) continue;
    return hit[1]
      .split(",")
      .map((part) => part.trim())
      .filter((part) => !part.startsWith("index "))
      .map((part) => part.split(".").pop()!);
  }
  return [];
}

export function isForeignKeyViolation(error: unknown): boolean {
  return messages(error).some((m) => /FOREIGN KEY constraint failed/i.test(m));
}

/** Un fallo por los datos escritos (restricción o tipo), no del motor. */
export function isDataViolation(error: unknown): boolean {
  return messages(error).some((m) =>
    /constraint failed|datatype mismatch/i.test(m),
  );
}
