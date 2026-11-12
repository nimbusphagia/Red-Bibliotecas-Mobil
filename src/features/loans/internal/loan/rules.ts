import {
  LoanLimitError,
  VisitorBlockedError,
} from "@/features/shared/errors/errors";
import type { OpenCounts, VisitorLoanStatus } from "./types";

export const MAX_OPEN_COPIES = 5;
export const BLOCK_AT_OVERDUE = 3;

export function assertCanBorrow(counts: OpenCounts, requested: number): void {
  if (counts.overdue >= BLOCK_AT_OVERDUE) {
    throw new VisitorBlockedError(counts.overdue, BLOCK_AT_OVERDUE);
  }
  if (counts.open + requested > MAX_OPEN_COPIES) {
    throw new LoanLimitError(counts.open, requested, MAX_OPEN_COPIES);
  }
}

export function statusOf(counts: OpenCounts): VisitorLoanStatus {
  const blocked = counts.overdue >= BLOCK_AT_OVERDUE;
  return {
    ...counts,
    blocked,
    remaining: blocked ? 0 : Math.max(0, MAX_OPEN_COPIES - counts.open),
  };
}
