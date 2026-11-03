import type { author, COLLABORATOR_ROLES } from "@/db/schema";
import type { SortDirection } from "@/shared/types";

export type Author = typeof author.$inferSelect;
export type AuthorWithBookCount = Author & { bookCount: number };
export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number];

export type NewAuthor = {
  firstName: string;
  lastName: string | null;
};

export const AUTHOR_SORT_KEYS = ["name", "createdAt", "bookCount"] as const;
export type AuthorSort = (typeof AUTHOR_SORT_KEYS)[number];

export type AuthorListFilters = {
  tokens: string[];
  role?: CollaboratorRole;
  withBooks?: boolean;
  sortBy: AuthorSort;
  sortDir: SortDirection;
  limit: number;
  offset: number;
};

export type AuthorUsage = { books: number; series: number };
