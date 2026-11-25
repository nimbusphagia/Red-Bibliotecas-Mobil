import type {
  CopyStatus,
  ReleasedStatus,
} from "@/features/inventory/internal/copy/types";

/** Los disponibles deteriorados van aparte; los prestados, no. */
export type HeldStatus = Exclude<CopyStatus, ReleasedStatus> | "damaged";

export type MonthCount = { month: Date; count: number };

export type LoanPreview = {
  id: number;
  visitorName: string;
  expiresBy: string;
};

export type DashboardSummary = {
  overdue: number;
  dueSoon: number;
  oldestOverdue: LoanPreview[];
  nextDue: LoanPreview[];
  unlabeled: number;
  labeled: number;
  outdated: number;
  copies: Record<HeldStatus, number>;
  monthlyLoans: MonthCount[];
};
