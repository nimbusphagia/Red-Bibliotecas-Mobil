import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { MOVEMENT_REASON_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";
import { formatDateES } from "@/features/shared/format/dates";

type Props = { movement: MovementListItem };

export default function MovementRow({ movement }: Props) {
  const amount =
    (movement.type === "entry" ? "+" : "-") + String(movement.copyCount);
  return (
    <PillRow className="">
      <Column text={`#${movement.id}`} variant="id" />
      <Column
        variant="subtitled"
        subtitle1={formatDateES(movement.createdAt)}
        text={movement.signedByUsername}
      />
      <Column
        variant="subtitled"
        text={amount}
        subtitle1={MOVEMENT_REASON_ES[movement.reason]}
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
