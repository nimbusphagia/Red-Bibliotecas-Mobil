import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  FieldError,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { LABEL_STATE_ES } from "@/features/shared/format/translate";
import { Minus } from "lucide-react-native";
import { View } from "react-native";
import { LABEL_STATE_ICON, labelStateOf } from "../labelState";

type Props = {
  copies: CopyItem[];
  error?: string;
  onRemove: (id: number) => void;
};

export default function LabelCopyTable({ copies, error, onRemove }: Props) {
  return (
    <View className="gap-2">
      {copies.length === 0 && <Text variant="caption">Sin ejemplares</Text>}
      {copies.map((c) => {
        const state = labelStateOf(c);
        return (
          <ListRow key={c.id} compact>
            <Column variant="id" text={`#${c.id}`} />
            <Column
              variant="subtitled"
              text={c.bookTitle}
              subtitle1={c.authors ?? undefined}
            />
            <Column expand={false} containerClass="w-44 shrink-0 gap-2">
              <Icon icon={LABEL_STATE_ICON[state]} size="lg" stroke="sm" />
              <Text variant="itemSm">{LABEL_STATE_ES[state]}</Text>
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
