import type { LINE_OUTCOMES, loanMovement } from "@/db/schema";
import type { ExitResult } from "@/features/inventory/movement/types";
import type { ListFilters } from "@/shared/types/types";
import type { LoanSort, OpenLineSort } from "./schemas";

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
};

export type OpenLineFilters = ListFilters<OpenLineSort> & {
  visitorId?: number;
  overdue?: boolean;
  today: string;
};

export type OpenLoanLine = {
  lineId: number;
  loanId: number;
  copyId: number;
  bookId: number;
  bookTitle: string;
  copyNumber: number;
  labelText: string | null;
  visitorId: number;
  visitorName: string;
  loanedAt: Date;
  expiresBy: string;
  overdue: boolean;
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
};
