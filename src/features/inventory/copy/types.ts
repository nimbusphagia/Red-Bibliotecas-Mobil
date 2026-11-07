import type { COPY_STATUSES, copy } from "@/db/schema";
import type { SortDirection } from "@/shared/types/types";
import type { CopySort } from "./schemas";

export type Copy = typeof copy.$inferSelect;
export type NewCopy = { bookId: number; shelfId: number; copyNumber: number };

export type CopyStatus = (typeof COPY_STATUSES)[number];

export const RELEASED_STATUSES = ["lost", "discarded"] as const;
export type ReleasedStatus = (typeof RELEASED_STATUSES)[number];

export type CopyLookup = {
  id: number;
  bookId: number;
  title: string;
  copyNumber: number;
  status: CopyStatus;
  labelText: string | null;
};

export type CopyListFilters = {
  bookId: number;
  status?: CopyStatus;
  shelfId?: number;
  sortBy: CopySort;
  sortDir: SortDirection;
  limit: number;
  offset: number;
};

export type CopyItem = {
  id: number;
  bookId: number;
  bookTitle: string;
  copyNumber: number;
  status: CopyStatus;
  notes: string | null;
  shelfId: number;
  shelfName: string;
  labelText: string | null;
  labelRevoked: boolean;
};
