import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import {
  MOVEMENT_REASON_ES,
  MOVEMENT_TYPE_ES,
} from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";
import { formatDateES } from "@/features/shared/format/dates";

type Props = { movement: MovementListItem };

export default function MovementRow({ movement }: Props) {
  return (
    <PillRow className="">
      <Column text={`#${movement.id}`} variant="id" />
      <Column
        variant="subtitled"
        subtitle1={formatDateES(movement.createdAt)}
        text={movement.signedByUsername}
        expand={false}
        containerClass="w-[200]"
      />
      <Column
        variant="subtitled"
        text={String(movement.copyCount)}
        subtitle1={`Ejemplar${movement.copyCount > 1 ? "es" : ""}`}
        expand={false}
        containerClass="w-[100]"
      />
      <Column variant="actions" expand={false} containerClass="w-[250]">
        <StatusBadge
          text={MOVEMENT_TYPE_ES[movement.type]}
          variant={movement.type === "entry" ? "active" : "pending"}
        />
      </Column>
      <Column
        text={MOVEMENT_REASON_ES[movement.reason]}
        expand={false}
        containerClass="w-[200] justify-center"
      />
      <Column variant="actions" expand={false} containerClass="w-[90]">
        <Link href={`/stock/${movement.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={18} color={colors.highlight} />}
          />
        </Link>
      </Column>
    </PillRow>
  );
}
