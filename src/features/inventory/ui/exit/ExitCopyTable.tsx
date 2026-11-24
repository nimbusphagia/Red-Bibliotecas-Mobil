import type { CopyItem } from "@/features/inventory/internal/copy/types";
import type { ExitReason } from "@/features/inventory/internal/movement/types";
import {
  Button,
  Column,
  FieldError,
  ListRow,
  StatusIcon,
  Text,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { status } from "@/features/shared/theme";
import { Minus } from "lucide-react-native";
import { View } from "react-native";
import { COPY_STATUS_ACCENT, COPY_STATUS_ICON } from "../copies/statusIcon";
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
              subtitle1={c.authors ?? undefined}
            />
            <Column expand={false} containerClass="w-32 shrink-0 gap-2">
              <StatusIcon
                icon={COPY_STATUS_ICON[c.status]}
                accent={blocked ? undefined : COPY_STATUS_ACCENT[c.status]}
                tone={blocked ? status.warning.icon : undefined}
              />
              <Text
                variant="itemSm"
                className={blocked ? status.warning.text : undefined}
              >
                {COPY_STATUS_ES[c.status]}
              </Text>
            </Column>
            <Column variant="actions" expand={false}>
              <Button
                variant="soft"
                icon={Minus}
                size="sm"
                className="size-7"
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
