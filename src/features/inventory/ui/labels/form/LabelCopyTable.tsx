import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  FieldError,
  ListRow,
  StatusBadge,
  Text,
} from "@/features/shared/components";
import { LABEL_STATE_ES } from "@/features/shared/format/translate";
import { Trash } from "lucide-react-native";
import { View } from "react-native";
import { BADGE_VARIANT, labelStateOf } from "../labelState";

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
              subtitle1={c.labelText ?? undefined}
              subtitle2={c.authors ?? undefined}
            />
            <Column variant="actions" expand={false}>
              <StatusBadge
                text={LABEL_STATE_ES[state]}
                variant={BADGE_VARIANT[state]}
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
