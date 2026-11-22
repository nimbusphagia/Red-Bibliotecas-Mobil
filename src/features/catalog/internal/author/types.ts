import type { author, COLLABORATOR_ROLES } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { AuthorSort } from "./schemas";

export type Author = typeof author.$inferSelect;
export type AuthorWithBookCount = Author & { bookCount: number };
export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number];

export type NewAuthor = {
  firstName: string;
  lastName: string | null;
  nameKey: string;
  code: string | null;
};

export type AuthorListFilters = ListFilters<AuthorSort> & {
  role?: CollaboratorRole;
  withBooks?: boolean;
};

export type AuthorUsage = { books: number; series: number };
