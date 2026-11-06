export function nextFreeNumbers(
  taken: readonly number[],
  count: number,
): number[] {
  const used = new Set(taken);
  const out: number[] = [];
  for (let n = 1; out.length < count; n++) {
    if (!used.has(n)) out.push(n);
  }
  return out;
}
