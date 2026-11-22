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
  bookId?: number;
  tokens: string[];
  status?: CopyStatus;
  shelfId?: number;
  /** true: ya etiquetados; false: pendientes de etiquetar. */
  labeled?: boolean;
  /** true: solo los etiquetados cuyo tejuelo ya no coincide. */
  outdated?: boolean;
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
  /** Escritores del libro; null si no tiene. */
  authors: string | null;
  copyNumber: number;
  status: CopyStatus;
  notes: string | null;
  shelfId: number;
  shelfName: string;
  shelfIsDefault: boolean;
  labelText: string | null;
  labeledAt: Date | null;
  /** Etiquetado, pero el tejuelo de hoy ya no coincide con el pegado. */
  outdated: boolean;
  loan: CopyLoan | null;
};

export type CopyLoan = {
  loanId: number;
  visitorId: number;
  visitorName: string;
  expiresBy: string;
  overdue: boolean;
};

export type LabelCandidate = {
  id: number;
  status: CopyStatus;
  labeledAt: Date | null;
  /** Texto pegado al etiquetar; null si está pendiente. */
  labeledText: string | null;
  /** Tejuelo derivado hoy; null si al libro le falta algún dato. */
  derivedText: string | null;
};

export type LabelFailure<R extends string> = {
  copyId: number;
  reason: R;
  /** Solo en `conflict`: el ejemplar que ya tiene ese tejuelo. */
  conflictingCopyId?: number;
};

export type MarkFailureReason =
  | "not_found"
  | "released"
  | "incomplete"
  | "conflict";

export type MarkLabeledResult = {
  /** Etiquetados ahora, incluidos los desactualizados que se volvieron a guardar. */
  labeled: number[];
  alreadyLabeled: number[];
  failed: LabelFailure<MarkFailureReason>[];
};

/** Tejuelo de hoy de un ejemplar, listo para imprimir. */
export type PrintLabel = { copyId: number; text: string };

export type PrintSkipReason = "not_found" | "released" | "incomplete";

export type PrintLabelsResult = {
  labels: PrintLabel[];
  skipped: { copyId: number; reason: PrintSkipReason }[];
};

export type CopyItemRow = Omit<CopyItem, "loan"> & {
  loanId: number | null;
  visitorId: number | null;
  visitorName: string | null;
  expiresBy: string | null;
};
