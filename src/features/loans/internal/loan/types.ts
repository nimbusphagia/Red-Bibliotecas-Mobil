import type { GRADE_LEVELS, LINE_OUTCOMES, loanMovement } from "@/db/schema";
import type { CopyStatus } from "@/features/inventory/internal/copy/types";
import type { ExitResult } from "@/features/inventory/internal/movement/types";
import type { ListFilters } from "@/features/shared/types/types";
import type { LineStatus, LoanSort } from "./schemas";
import type { VisitorRole } from "../visitor/types";

export type LoanMovement = typeof loanMovement.$inferSelect;
export type LineOutcome = (typeof LINE_OUTCOMES)[number];
export type LoanState = "open" | "closed" | "overdue";

export type NewLoanMovement = {
  loanedById: number;
  loanedToId: number;
  expiresBy: string;
  notes: string | null;
};

export type OpenCounts = { open: number; overdue: number };

export type VisitorLoanStatus = OpenCounts & {
  blocked: boolean;
  remaining: number;
};

export type LoanListFilters = ListFilters<LoanSort> & {
  visitorId?: number;
  state?: LoanState;
  from?: Date;
  until?: Date;
  today: string;
};

export type LoanListItem = LoanMovement & {
  visitorName: string;
  visitorRole: VisitorRole;
  visitorGrade: number | null;
  visitorLevel: (typeof GRADE_LEVELS)[number] | null;
  loanedByUsername: string;
  lineCount: number;
  openCount: number;
  overdue: boolean;
};

export type LoanLine = {
  id: number;
  copyId: number;
  bookId: number;
  bookTitle: string;
  copyNumber: number;
  labelText: string | null;
  resolvedAt: Date | null;
  outcome: LineOutcome | null;
  resolvedByUsername: string | null;
  status: CopyStatus;
  /** Recuperación que revirtió la salida de stock que generó la línea. */
  recoveryId: number | null;
};

export type VisitorLine = LoanLine & { loanId: number; createdAt: Date };

export type VisitorLineFilters = Pick<
  ListFilters<"createdAt">,
  "sortDir" | "limit" | "offset"
> & {
  visitorId: number;
  status?: LineStatus;
};

export type LentCopy = {
  copyId: number;
  bookId: number;
  title: string;
  copyNumber: number;
  labelText: string | null;
};

export type LendResult = { movement: LoanMovement; copies: LentCopy[] };

export type ReturnResult = {
  returned: number;
  damaged: ExitResult | null;
  lost: ExitResult | null;
  discarded: ExitResult | null;
};
