import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { ItemCard } from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";

// TODO: placeholder. Calcular con préstamos, devoluciones, pérdidas y daños.
const REPUTATIONS = ["Confiable", "Regular", "En riesgo"];

type Props = { visitor: VisitorListItem };

export default function VisitorCard({ visitor }: Props) {
  const reputation = REPUTATIONS[visitor.id % REPUTATIONS.length];
  const chips =
    visitor.role === "student"
      ? [gradeLabel(visitor.grade!, visitor.level!), reputation]
      : [reputation];

  return (
    <ItemCard
      title={visitor.name}
      subtitle={ROLE_ES[visitor.role]}
      href={`/visitors/${visitor.id}`}
      chips={chips}
    />
  );
}
