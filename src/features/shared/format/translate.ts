import { CopyStatus } from "@/features/inventory/internal/copy/types";
import type { VisitorRole } from "@/features/loans/internal/visitor/types";
import type { GRADE_LEVELS } from "@/db/schema";
import { LineOutcome, LoanState } from "@/features/loans/internal/loan/types";

export const COPY_STATUS_ES: Record<CopyStatus, string> = {
  available: "Disponible",
  on_loan: "Prestado",
  lost: "Perdido",
  discarded: "Descartado",
  damaged: "Dañado",
};

export const ROLE_ES: Record<VisitorRole, string> = {
  student: "Estudiante",
  teacher: "Profesor",
};

const LEVEL_ES: Record<(typeof GRADE_LEVELS)[number], string> = {
  primary: "Primaria",
  secondary: "Secundaria",
};

export const gradeLabel = (
  grade: number,
  level: (typeof GRADE_LEVELS)[number],
) => `${grade}° ${LEVEL_ES[level]}`;

export const OUTCOME_ES: Record<LineOutcome, string> = {
  returned: "Devuelto",
  returned_damaged: "Devuelto dañado",
  lost: "Perdido",
};

export const LOAN_STATE_ES: Record<LoanState, string> = {
  open: "Activo",
  overdue: "Vencido",
  closed: "Devuelto",
};
