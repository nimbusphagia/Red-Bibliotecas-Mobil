import type { label, PRINT_STATUSES } from "@/db/schema";
import type { ListFilters } from "@/features/shared/types/types";
import type { LabelSort } from "./schemas";

export type Label = typeof label.$inferSelect;

export type NewLabel = Pick<
  Label,
  | "copyId"
  | "categoryCode"
  | "authorCode"
  | "subcategoryCode"
  | "titleCode"
  | "copyNumber"
  | "text"
>;

export type LabelOwner = {
  bookId: number;
  title: string;
  seriesId: number | null;
};

export type PrintStatus = (typeof PRINT_STATUSES)[number];

export type LabelListFilters = ListFilters<LabelSort> & {
  printStatus?: PrintStatus;
  shelfId?: number;
  bookId?: number;
  includeRevoked: boolean;
};

export type LabelItem = {
  id: number;
  copyId: number;
  bookId: number;
  bookTitle: string;
  authorName: string | null;
  shelfName: string;
  shelfIsDefault: boolean;
  copyNumber: number;
  text: string;
  printStatus: PrintStatus;
  printedAt: Date | null;
  revision: number;
  revoked: boolean;
};

export type LabelState = {
  id: number;
  revoked: boolean;
};

export type LabelCodes = Pick<
  Label,
  "categoryCode" | "authorCode" | "subcategoryCode" | "titleCode"
>;
