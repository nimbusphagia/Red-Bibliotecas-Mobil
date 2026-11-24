import type { Reputation } from "@/features/loans/internal/visitor/reputation";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { ItemCard } from "@/features/shared/components";
import {
  gradeLabel,
  REPUTATION_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";
import type { AccentLevel } from "@/features/shared/theme";

type Props = { visitor: VisitorListItem };

const REPUTATION_ACCENT: Record<Reputation, AccentLevel> = {
  new: "sm",
  regular: "sm",
  reliable: "lg",
  at_risk: "neg",
};

export default function VisitorCard({ visitor }: Props) {
  const reputation = {
    label: REPUTATION_ES[visitor.reputation],
    accent: REPUTATION_ACCENT[visitor.reputation],
  };
  const chips =
    visitor.role === "student"
      ? [{ label: gradeLabel(visitor.grade!, visitor.level!) }, reputation]
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
