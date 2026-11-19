import type { COPY_STATUSES, copy } from "@/db/schema";
import type { SortDirection } from "@/features/shared/types/types";
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
  shelfId: number;
  labelText: string | null;
};

export type CopyListFilters = {
  bookId: number;
  status?: CopyStatus;
  shelfId?: number;
  excludeReleased?: boolean;
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
  shelfIsDefault: boolean;
  labelText: string | null;
  labelRevoked: boolean;
  loan: CopyLoan | null;
};

export type CopyLoan = {
  loanId: number;
  visitorId: number;
  visitorName: string;
  expiresBy: string;
  overdue: boolean;
};

export type CopyItemRow = Omit<CopyItem, "loan"> & {
  loanId: number | null;
  visitorId: number | null;
  visitorName: string | null;
  expiresBy: string | null;
};
