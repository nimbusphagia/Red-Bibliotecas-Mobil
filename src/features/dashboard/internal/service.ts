import { addDays, toISODate } from "@/features/shared/format/dates";
import { addMonths, addYears, startOfYear } from "date-fns";
import * as repo from "./repository";
import type { DashboardSummary, HeldStatus } from "./types";

const DUE_SOON_DAYS = 7;
const PREVIEW = 3;

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const today = toISODate();
  const soon = addDays(today, DUE_SOON_DAYS);
  const yearStart = startOfYear(new Date());

  const [loans, oldestOverdue, nextDue, held, months] = await Promise.all([
    repo.countOpenLoans(today, soon),
    repo.listOldestOverdue(today, PREVIEW),
    repo.listDueSoon(today, soon, PREVIEW),
    repo.countHeldCopies(),
    repo.countLoanLinesByMonth(yearStart, addYears(yearStart, 1)),
  ]);

  const copies: Record<HeldStatus, number> = {
    available: 0,
    on_loan: 0,
    damaged: 0,
  };
  let total = 0;
  let unlabeled = 0;
  for (const row of held) {
    copies[row.status as HeldStatus] = row.n;
    total += row.n;
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
    nextDue,
    unlabeled,
    labeled: total - unlabeled,
    copies,
    monthlyLoans,
  };
}
