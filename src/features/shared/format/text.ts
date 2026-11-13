export const collapse = (s: string) => s.trim().replace(/\s+/g, " ");

export const clamp = (min: number, max: number) => (n: number) =>
  Math.min(Math.max(n, min), max);

export const searchKey = (s: string) =>
  collapse(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const arrToString = (arr: string[]) => arr.join(", ");
