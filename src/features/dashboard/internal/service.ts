import { addDays, toISODate } from "@/features/shared/format/dates";
import { addMonths, addYears, startOfYear } from "date-fns";
import * as repo from "./repository";
import type { DashboardSummary, HeldStatus } from "./types";

const DUE_SOON_DAYS = 7;
const OVERDUE_PREVIEW = 3;

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const today = toISODate();
  const yearStart = startOfYear(new Date());

  const [loans, oldestOverdue, held, months] = await Promise.all([
    repo.countOpenLoans(today, addDays(today, DUE_SOON_DAYS)),
    repo.listOldestOverdue(today, OVERDUE_PREVIEW),
    repo.countHeldCopies(),
    repo.countLoanLinesByMonth(yearStart, addYears(yearStart, 1)),
  ]);

  const copies: Record<HeldStatus, number> = {
    available: 0,
    on_loan: 0,
    damaged: 0,
  };
  let unlabeled = 0;
  for (const row of held) {
    copies[row.status as HeldStatus] = row.n;
    unlabeled += row.unlabeled;
  }

  const monthlyLoans = Array.from({ length: 12 }, (_, i) => ({
    month: addMonths(yearStart, i),
    count: 0,
  }));
  for (const { month, n } of months) monthlyLoans[month - 1].count = n;

  return {
    ...loans,
    oldestOverdue,
    unlabeled,
    copies,
    monthlyLoans,
  };
}
