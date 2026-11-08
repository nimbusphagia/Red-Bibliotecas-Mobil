import type { loanRule, schoolGrade } from "@/db/schema";

export type LoanRule = typeof loanRule.$inferSelect;
export type SchoolGrade = typeof schoolGrade.$inferSelect;
