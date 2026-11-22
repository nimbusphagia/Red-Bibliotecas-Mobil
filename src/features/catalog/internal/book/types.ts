import type { book } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { CollaboratorRole } from "../author/types";
import type { BookSort } from "./schemas";

export type Book = typeof book.$inferSelect;

/** Los cuatro códigos que forman el tejuelo de un libro. */
export type LabelCodes = {
  categoryCode: string;
  authorCode: string;
  subcategoryCode: string;
  titleCode: string;
};

export type BookCollaborator = { authorId: number; role: CollaboratorRole };

export type BookCollaboratorDetail = BookCollaborator & {
  firstName: string;
  lastName: string | null;
};

export type BookWithCollaborators = Book & {
  collaborators: BookCollaboratorDetail[];
};

export type BookListItem = BookWithCollaborators & {
  publisherName: string | null;
  collectionName: string | null;
  seriesName: string | null;
  categoryName: string | null;
  subcategoryName: string | null;
  copyCount: number;
  activeCount: number;
  availableCount: number;
  onLoanCount: number;
};

export type NewBook = {
  title: string;
  titleKey: string;
  publisherId: number | null;
  collectionId: number | null;
  seriesId: number | null;
  categoryId: number | null;
  subcategoryId: number | null;
  publicationYear: number | null;
  pageCount: number | null;
  titleCode: string;
  omitWords: string[];
};

export type BookPatch = Partial<NewBook>;

export type BookListFilters = ListFilters<BookSort> & {
  authorId?: number;
  role?: CollaboratorRole;
  publisherId?: number;
  collectionId?: number;
  seriesId?: number;
  categoryId?: number;
  subcategoryId?: number;
  shelfId?: number;
  active?: boolean;
};

export type BookUsage = { copies: number };
