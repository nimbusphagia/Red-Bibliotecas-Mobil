import type { CopyItem } from "@/features/inventory/internal/copy/types";
import type { ExitReason } from "@/features/inventory/internal/movement/types";
import {
  Button,
  Column,
  FieldError,
  ListRow,
  Text,
} from "@/features/shared/components";
import { status } from "@/features/shared/theme";
import { Minus } from "lucide-react-native";
import { View } from "react-native";
import { canExit } from "./canExit";

type Props = {
  copies: CopyItem[];
  reason: ExitReason;
  error?: string;
  onRemove: (id: number) => void;
};

export default function ExitCopyTable({
  copies,
  reason,
  error,
  onRemove,
}: Props) {
  return (
    <View className="gap-2">
      {copies.length === 0 && <Text variant="caption">Sin ejemplares</Text>}
      {copies.map((c) => {
        const blocked = !canExit(c, reason);
        return (
          <ListRow key={c.id} compact>
            <Column variant="id" text={`#${c.id}`} />
            <Column
              variant="subtitled"
              text={c.bookTitle}
              textClass={blocked ? status.warning.text : undefined}
              subtitle1={c.authors ?? undefined}
            />
            <Column text={c.labelText ?? "---"} />
            <Column variant="actions" expand={false}>
              <Button
                variant="soft"
                icon={Minus}
                size="sm"
                className="size-7 bg-transparent"
                onPress={() => onRemove(c.id)}
              />
            </Column>
          </ListRow>
        );
      })}
      <FieldError>{error}</FieldError>
    </View>
  );
}
