import type { RECOVERY_REASON, stockMovement } from "@/db/schema";
import type { SortDirection } from "@/features/shared/types/types";
import type { CopyStatus, ReleasedStatus } from "../copy/types";
import type { ENTRY_REASONS, EXIT_REASONS, MovementSort } from "./schemas";

export type StockMovement = typeof stockMovement.$inferSelect;
export type MovementType = StockMovement["type"];
export type MovementReason = StockMovement["reason"];
export type EntryReason = (typeof ENTRY_REASONS)[number];
export type ExitReason = (typeof EXIT_REASONS)[number];

export type RecoveryReason = typeof RECOVERY_REASON;

export type NewEntryMovement = {
  reason: EntryReason | RecoveryReason;
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

/** Salidas que se pueden revertir con una recuperación. */
export const RECOVERABLE_REASONS = [
  "loss",
  "damage",
] as const satisfies readonly ExitReason[];
export type RecoverableReason = (typeof RECOVERABLE_REASONS)[number];

export type RecoveryResult = {
  movement: StockMovement;
  copyId: number;
  previousStatus: CopyStatus;
  newStatus: "available" | "damaged";
};

export type RegisteredCopy = {
  copyId: number;
  copyNumber: number;
  shelfId: number;
  labelText: string | null;
};

export type RegisteredLine = {
  lineIndex: number;
  bookId: number;
  title: string;
  isNewBook: boolean;
  titleCode: string;
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

/** Resumen de un mes ("YYYY-MM"): ejemplares que entraron y salieron. */
export type MovementMonth = {
  month: string;
  entries: number;
  exits: number;
};

export type ExitLine = {
  id: number;
  reason: MovementReason;
  copyId: number;
  bookId: number;
  copyNumber: number;
  status: CopyStatus;
  labeledText: string | null;
};

export type MovementLine = {
  id: number;
  copyId: number;
  bookId: number;
  bookTitle: string;
  authors: string | null;
  copyNumber: number;
  status: CopyStatus;
  shelfId: number;
  shelfName: string;
  labelText: string | null;
  loanId: number | null;
  /** En una salida: la recuperación que la revirtió. */
  recoveryId: number | null;
  /** En una recuperación: la salida que revierte. */
  recoveredExitId: number | null;
};
