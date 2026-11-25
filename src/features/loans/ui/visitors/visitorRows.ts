import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import type { DetailRow } from "@/features/shared/components";
import {
  gradeLabel,
  REPUTATION_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";

export const visitorRoleLabel = (visitor: VisitorListItem) =>
  visitor.role === "student"
    ? `${ROLE_ES.student} · ${gradeLabel(visitor.grade!, visitor.level!)}`
    : ROLE_ES[visitor.role];

/**
 * Sin el nombre: el formulario de préstamo lo muestra como campo editable.
 * Siempre las mismas filas; vacías mientras no hay visitante.
 */
export const visitorInfoRows = (visitor?: VisitorListItem): DetailRow[] => [
  { label: "Rol", content: visitor && ROLE_ES[visitor.role] },
  {
    label: "Grado",
    content:
      visitor?.role === "student"
        ? gradeLabel(visitor.grade!, visitor.level!)
        : undefined,
  },
  {
    label: "Reputación",
    content: visitor && REPUTATION_ES[visitor.reputation],
  },
];

export const visitorRows = (visitor: VisitorListItem): DetailRow[] => [
  { label: "Nombre", content: visitor.name },
  ...visitorInfoRows(visitor).filter((r) => r.content),
];
