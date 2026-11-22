import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { MOVEMENT_REASON_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";

type Props = { movement: MovementListItem };

export default function MovementRow({ movement }: Props) {
  const amount =
    (movement.type === "entry" ? "+" : "-") + String(movement.copyCount);
  return (
    <ListRow>
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

      <Column variant="actions" width="sm">
        <Link href={`/stock/${movement.id}`} asChild>
          <Button variant="soft" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
