import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import { Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate } from "@/features/shared/format/dates";
import {
  MOVEMENT_REASON_ES,
  MOVEMENT_TYPE_ES,
} from "@/features/shared/format/translate";

type Props = { movement: MovementListItem };

export default function MovementRow({ movement }: Props) {
  return (
    <PillRow className="gap-6">
      <Column text={`#${movement.id}`} variant="id" />
      <Column
        variant="subtitled"
        text={movement.signedByUsername}
        subtitle1={formatDate(movement.createdAt)}
      />
      <Column variant="actions">
        <StatusBadge
          text={MOVEMENT_TYPE_ES[movement.type]}
          variant={movement.type === "entry" ? "active" : "pending"}
        />
      </Column>
      <Column
        variant="subtitled"
        text={MOVEMENT_REASON_ES[movement.reason]}
        subtitle1="Motivo"
      />
      <Column
        variant="subtitled"
        text={String(movement.copyCount)}
        subtitle1="Ejemplares"
      />
    </PillRow>
  );
}
