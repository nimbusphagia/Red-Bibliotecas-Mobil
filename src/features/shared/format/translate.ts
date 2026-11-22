import {
  CopyStatus,
  MarkFailureReason,
} from "@/features/inventory/internal/copy/types";
import type { VisitorRole } from "@/features/loans/internal/visitor/types";
import type { GRADE_LEVELS } from "@/db/schema";
import { LineOutcome, LoanState } from "@/features/loans/internal/loan/types";
import {
  MovementReason,
  MovementType,
} from "@/features/inventory/internal/movement/types";

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
export const MOVEMENT_TYPE_ES: Record<MovementType, string> = {
  entry: "Entrada",
  exit: "Salida",
};

export const MOVEMENT_REASON_ES: Record<MovementReason, string> = {
  purchase: "Compra",
  donation: "Donación",
  loss: "Pérdida",
  damage: "Daño",
  discard: "Descarte",
  other: "Otro",
};

export const shelfLabel = (shelf: { name: string; isDefault: boolean }) =>
  shelf.isDefault ? "Estantería General" : shelf.name;

export const LABEL_STATE_ES = {
  pending: "Sin etiquetar",
  labeled: "Etiquetado",
  outdated: "Desactualizado",
} as const;

export const MARK_FAILURE_ES: Record<MarkFailureReason, string> = {
  not_found: "El ejemplar ya no existe",
  released: "Está dado de baja (perdido o descartado)",
  incomplete:
    "Al libro le falta categoría, subcategoría, escritor o título para armar el tejuelo",
  conflict: "Otro ejemplar ya tiene ese tejuelo",
};

export const markFailureText = (f: {
  reason: MarkFailureReason;
  conflictingCopyId?: number;
}) =>
  f.reason === "conflict" && f.conflictingCopyId !== undefined
    ? `${MARK_FAILURE_ES.conflict} (#${f.conflictingCopyId})`
    : MARK_FAILURE_ES[f.reason];
