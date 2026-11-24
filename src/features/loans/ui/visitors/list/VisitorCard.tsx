import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { ItemCard } from "@/features/shared/components";
import {
  gradeLabel,
  REPUTATION_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";

type Props = { visitor: VisitorListItem };

export default function VisitorCard({ visitor }: Props) {
  const reputation = REPUTATION_ES[visitor.reputation];
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
