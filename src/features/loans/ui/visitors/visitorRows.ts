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

/** Sin el nombre: el formulario de préstamo lo muestra como campo editable. */
export const visitorInfoRows = (visitor: VisitorListItem): DetailRow[] => [
  { label: "Rol", content: ROLE_ES[visitor.role] },
  ...(visitor.role === "student"
    ? [{ label: "Grado", content: gradeLabel(visitor.grade!, visitor.level!) }]
    : []),
  { label: "Reputación", content: REPUTATION_ES[visitor.reputation] },
];

export const visitorRows = (visitor: VisitorListItem): DetailRow[] => [
  { label: "Nombre", content: visitor.name },
  ...visitorInfoRows(visitor),
];
