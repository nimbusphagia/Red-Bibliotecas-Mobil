import { VISITOR_ROLES } from "@/db/schema";
import { NotFoundError } from "@/errors/errors";
import { parseOrThrow } from "@/shared/validation/validation";
import { z } from "zod";
import * as repo from "./repository";
import type { LoanRule, SchoolGrade } from "./types";

export const listLoanRules = (): Promise<LoanRule[]> => repo.listLoanRules();

export const listSchoolGrades = (): Promise<SchoolGrade[]> =>
  repo.listSchoolGrades();

export async function getLoanRule(role: LoanRule["role"]): Promise<LoanRule> {
  const valid = parseOrThrow(z.enum(VISITOR_ROLES), role);
  const found = await repo.findLoanRuleByRole(valid);
  if (!found) throw new NotFoundError("loan rule", 0);
  return found;
}
