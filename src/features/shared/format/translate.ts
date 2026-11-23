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

const IMPORT_PROBLEM_ES: Record<ProblemCode, (detail: string) => string> = {
  missing: () => "es obligatorio",
  too_long: () => "es demasiado largo",
  bad_number: (d) => `«${d}» no es un número válido`,
  out_of_range: (d) => `«${d}» está fuera del rango permitido`,
  bad_person: (d) => `«${d}» debe escribirse «Apellido, Nombre»`,
  title_unusable: () => "debe tener letras o números",
  writer_unusable: (d) => `no se puede generar el código de «${d}»`,
  too_many_words: () => "tiene demasiadas palabras",
  unknown_category: (d) => `«${d}» no es un código ni un nombre de categoría`,
  unknown_subcategory: (d) =>
    `«${d}» no es un código ni un nombre de subcategoría`,
  unknown_shelf: (d) => `«${d}» no existe`,
  collection_without_publisher: () => "requiere indicar la editorial",
  book_exists: (d) => `«${d}» ya existe: agrégale ejemplares desde «Existente»`,
  duplicate_in_file: (d) => `es el mismo libro de la fila ${d}`,
  label_conflict: (d) => `el tejuelo ya lo usa «${d}»; omite palabras en común`,
  label_conflict_in_file: (d) =>
    `el tejuelo coincide con el de la fila ${d}; omite palabras en común`,
};

export const importProblemText = (p: RowProblem) =>
  `${headerOf(p.column)}: ${IMPORT_PROBLEM_ES[p.code](p.detail ?? "")}`;

export const sheetProblemText = (p: SheetProblem) =>
  p.code === "empty"
    ? "El archivo no tiene libros"
    : p.code === "missing_columns"
      ? `Faltan columnas: ${p.columns.join(", ")}`
      : `El archivo tiene ${p.count} filas; el máximo es ${p.max}`;
