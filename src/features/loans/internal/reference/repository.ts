import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { loanRule, schoolGrade } from "@/db/schema";
import type { LoanRule, SchoolGrade } from "./types";

export const listLoanRules = (): Promise<LoanRule[]> =>
  db.select().from(loanRule).orderBy(asc(loanRule.role));

export async function findLoanRuleByRole(
  role: LoanRule["role"],
): Promise<LoanRule | null> {
  const [row] = await db.select().from(loanRule).where(eq(loanRule.role, role));
  return row ?? null;
}

export const listSchoolGrades = (): Promise<SchoolGrade[]> =>
  db
    .select()
    .from(schoolGrade)
    .orderBy(asc(schoolGrade.level), asc(schoolGrade.grade));
