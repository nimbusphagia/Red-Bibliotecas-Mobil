import { BookListItem } from "@/features/catalog/internal/book/types";

export const collapse = (s: string) => s.trim().replace(/\s+/g, " ");

export const clamp = (min: number, max: number) => (n: number) =>
  Math.min(Math.max(n, min), max);

export const searchKey = (s: string) =>
  collapse(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const formatContributors = (list: BookListItem["collaborators"]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};
