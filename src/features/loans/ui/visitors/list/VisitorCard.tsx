import type { Reputation } from "@/features/loans/internal/visitor/reputation";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { ItemCard } from "@/features/shared/components";
import { REPUTATION_ES } from "@/features/shared/format/translate";
import type { AccentLevel } from "@/features/shared/theme";
import { visitorRoleLabel } from "../visitorRows";

type Props = { visitor: VisitorListItem };

const REPUTATION_ACCENT: Record<Reputation, AccentLevel | undefined> = {
  new: "sm",
  regular: undefined,
  reliable: "lg",
  at_risk: "neg",
};

export default function VisitorCard({ visitor }: Props) {
  const reputation = {
    label: REPUTATION_ES[visitor.reputation],
    accent: REPUTATION_ACCENT[visitor.reputation],
  };
  return (
    <ItemCard
      title={visitor.name}
      subtitle={visitorRoleLabel(visitor)}
      lead={visitor.lineCount === 1 ? "1 libro" : `${visitor.lineCount} libros`}
      href={`/visitors/${visitor.id}`}
      chips={[reputation]}
    />
  );
}
