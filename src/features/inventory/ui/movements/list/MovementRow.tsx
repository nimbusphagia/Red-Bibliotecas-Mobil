import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { MOVEMENT_REASON_ES } from "@/features/shared/format/translate";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { Link } from "expo-router";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react-native";
import { View } from "react-native";

type Props = { movement: MovementListItem };

export default function MovementRow({ movement }: Props) {
  const { isCompact } = useLayoutMode();
  const width = isCompact ? "md" : undefined;

  return (
    <ListRow>
      <Column
        variant="subtitled"
        width={width}
        subtitle1={MOVEMENT_REASON_ES[movement.reason]}
      >
        <View className="flex-row items-center gap-1">
          <Icon
            icon={movement.type === "entry" ? ArrowUp : ArrowDown}
            size="sm"
          />
          <Text variant="itemSm">{movement.copyCount}</Text>
        </View>
      </Column>
      <Column
        variant="subtitled"
        expand={!isCompact}
        containerClass={isCompact ? "w-36 shrink-0" : undefined}
        subtitle1={formatDateES(movement.createdAt)}
        text={movement.signedByUsername}
      />
      <Column text={movement.notes || "---"} />
      <Column variant="actions" width="sm">
        <Link href={`/stock/${movement.id}`} asChild>
          <Button
            icon={ChevronRight}
            variant="soft"
            className="bg-transparent"
          />
        </Link>
      </Column>
    </ListRow>
  );
}
