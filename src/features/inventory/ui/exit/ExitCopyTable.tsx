import type { CopyItem } from "@/features/inventory/internal/copy/types";
import type { ExitReason } from "@/features/inventory/internal/movement/types";
import {
  Button,
  Column,
  FieldError,
  ListRow,
  StatusBadge,
  Text,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { Trash } from "lucide-react-native";
import { View } from "react-native";
import { canExit } from "./canExit";

type Props = {
  copies: CopyItem[];
  reason?: ExitReason;
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
      {copies.length === 0 && (
        <Text variant="caption">
          {reason ? "Sin ejemplares" : "Elige primero el motivo"}
        </Text>
      )}
      {copies.map((c) => {
        const blocked = !!reason && !canExit(c, reason);
        return (
          <ListRow key={c.id} compact>
            <Column variant="id" text={`#${c.id}`} />
            <Column
              variant="subtitled"
              text={c.bookTitle}
              subtitle1={c.labelText ?? undefined}
              subtitle2={c.authors ?? undefined}
            />
            <Column variant="actions" expand={false}>
              <StatusBadge
                text={COPY_STATUS_ES[c.status]}
                variant={blocked ? "pending" : "active"}
              />
              <Button
                variant="soft"
                icon={Trash}
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
