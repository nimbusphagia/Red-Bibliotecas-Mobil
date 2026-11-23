import type {
  CopyStatus,
  ReleasedStatus,
} from "@/features/inventory/internal/copy/types";

export type HeldStatus = Exclude<CopyStatus, ReleasedStatus>;

export type MonthCount = { month: Date; count: number };

export type OverdueLoan = {
  id: number;
  visitorName: string;
  expiresBy: string;
};

export type DashboardSummary = {
  overdue: number;
  dueSoon: number;
  oldestOverdue: OverdueLoan[];
  unlabeled: number;
  copies: Record<HeldStatus, number>;
  monthlyLoans: MonthCount[];
};
