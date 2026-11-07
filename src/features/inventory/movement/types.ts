import type { stockMovement } from "@/db/schema";
import type { CopyStatus, ReleasedStatus } from "../copy/types";
import type { ENTRY_REASONS, EXIT_REASONS, MovementSort } from "./schemas";
import type { SortDirection } from "@/shared/types/types";

export type StockMovement = typeof stockMovement.$inferSelect;
export type EntryReason = (typeof ENTRY_REASONS)[number];
export type ExitReason = (typeof EXIT_REASONS)[number];

export type NewEntryMovement = {
  reason: EntryReason;
  signedById: number;
  notes: string | null;
};

export type NewExitMovement = {
  reason: ExitReason;
  signedById: number;
  notes: string | null;
};

export type ExitStatus = ReleasedStatus | "damaged";

export const EXIT_STATUS: Record<ExitReason, ExitStatus> = {
  loss: "lost",
  damage: "damaged",
  discard: "discarded",
};

export type TitleCodeSource = "existing" | "generated";

export type RegisteredCopy = {
  copyId: number;
  copyNumber: number;
  shelfId: number;
  labelText: string;
};

export type RegisteredLine = {
  lineIndex: number;
  bookId: number;
  title: string;
  isNewBook: boolean;
  titleCode: string;
  titleCodeSource: TitleCodeSource;
  copies: RegisteredCopy[];
};

export type EntryResult = {
  movement: StockMovement;
  lines: RegisteredLine[];
};

export type ExitedCopy = {
  copyId: number;
  bookId: number;
  title: string;
  copyNumber: number;
  labelText: string | null;
  previousStatus: CopyStatus;
  newStatus: ExitStatus;
};

export type ExitResult = {
  movement: StockMovement;
  copies: ExitedCopy[];
};

export type LabelPreview = {
  lineIndex: number;
  title: string;
  titleCode: string;
  titleCodeSource: TitleCodeSource;
  labelTexts: string[];
  conflict: { labelText: string; bookId: number | null; title: string } | null;
};

export type MovementListFilters = {
  type?: StockMovement["type"];
  reason?: StockMovement["reason"];
  signedById?: number;
  from?: Date;
  until?: Date;
  sortBy: MovementSort;
  sortDir: SortDirection;
  limit: number;
  offset: number;
};

export type MovementListItem = StockMovement & {
  signedByUsername: string;
  copyCount: number;
};

export type MovementLine = {
  copyId: number;
  bookId: number;
  bookTitle: string;
  copyNumber: number;
  status: CopyStatus;
  shelfId: number;
  shelfName: string;
  labelText: string | null;
};
