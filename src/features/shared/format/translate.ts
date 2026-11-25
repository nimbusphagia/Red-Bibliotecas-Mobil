import { headerOf } from "@/features/inventory/internal/entryImport/columns";
import type { SheetProblem } from "@/features/inventory/internal/entryImport/sheet";
import type {
  ProblemCode,
  RowProblem,
} from "@/features/inventory/internal/entryImport/types";
import {
  CopyStatus,
  MarkFailureReason,
  PrintSkipReason,
} from "@/features/inventory/internal/copy/types";
import type { Account } from "@/features/account/internal/types";
import type { VisitorRole } from "@/features/loans/internal/visitor/types";
import type { Reputation } from "@/features/loans/internal/visitor/reputation";
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
};

export const ROLE_ES: Record<VisitorRole, string> = {
  student: "Estudiante",
  teacher: "Profesor",
};

export const ACCOUNT_ROLE_ES: Record<Account["role"], string> = {
  owner: "Propietario",
  admin: "Administrador",
  staff: "Bibliotecario",
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
  returned_damaged: "Devuelto deteriorado",
  discarded: "Descartado",
  lost: "Perdido",
};

export const REPUTATION_ES: Record<Reputation, string> = {
  new: "Nuevo",
  reliable: "Confiable",
  regular: "Regular",
  at_risk: "Con incidencias",
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
  discard: "Descarte",
  other: "Otro",
  recovery: "Recuperación",
};

export const shelfLabel = (shelf: { name: string; isDefault: boolean }) =>
  shelf.isDefault ? "Estantería General" : shelf.name;

export const LABEL_STATE_ES = {
  pending: "Sin etiquetar",
  labeled: "Etiquetado",
  outdated: "Desactualizado",
} as const;

const NOT_LABELABLE_ES = {
  not_found: "El ejemplar ya no existe",
  released: "Está dado de baja (perdido o descartado)",
  incomplete:
    "Al libro le falta categoría, subcategoría, escritor o título para armar el tejuelo",
} as const;

const MARK_FAILURE_ES: Record<MarkFailureReason, string> = {
  ...NOT_LABELABLE_ES,
  conflict: "Otro ejemplar ya tiene ese tejuelo",
};

export const PRINT_SKIP_ES: Record<PrintSkipReason, string> = NOT_LABELABLE_ES;

export const markFailureText = (f: {
  reason: MarkFailureReason;
  conflictingCopyId?: number;
}) =>
  f.reason === "conflict" && f.conflictingCopyId !== undefined
    ? `${MARK_FAILURE_ES.conflict} (#${f.conflictingCopyId})`
    : MARK_FAILURE_ES[f.reason];

const IMPORT_PROBLEM_LABEL_ES: Record<ProblemCode, (header: string) => string> =
  {
    missing: (h) => `${h} obligatorio`,
    too_long: (h) => `${h} demasiado largo`,
    bad_number: (h) => `${h} inválido`,
    out_of_range: (h) => `${h} fuera de rango`,
    bad_person: (h) => `${h} con formato inválido`,
    title_unusable: () => "Título inválido",
    writer_unusable: () => "Autor inválido",
    too_many_words: (h) => `${h} con demasiadas palabras`,
    unknown_category: () => "Categoría inexistente",
    unknown_subcategory: () => "Subcategoría inexistente",
    unknown_shelf: () => "Estantería inexistente",
    collection_without_publisher: () => "Colección sin editorial",
    book_exists: () => "Título ya existe",
    duplicate_in_file: () => "Libro repetido",
    label_conflict: () => "Tejuelo en uso",
    label_conflict_in_file: () => "Tejuelo repetido",
  };

/** Tipo de problema, sin el detalle de la fila. */
export const importProblemLabel = (p: RowProblem) =>
  IMPORT_PROBLEM_LABEL_ES[p.code](headerOf(p.column));

export const sheetProblemText = (p: SheetProblem) =>
  p.code === "empty"
    ? "El archivo no tiene libros"
    : p.code === "missing_columns"
      ? `Faltan columnas: ${p.columns.join(", ")}`
      : `El archivo tiene ${p.count} filas; el máximo es ${p.max}`;
