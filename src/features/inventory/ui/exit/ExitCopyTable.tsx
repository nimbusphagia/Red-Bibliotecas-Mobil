import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  FieldError,
  ListRow,
  Text,
} from "@/features/shared/components";
import { Minus } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
  error?: string;
  onRemove: (id: number) => void;
};

export default function ExitCopyTable({ copies, error, onRemove }: Props) {
  return (
    <View className="gap-2">
      {copies.length === 0 && <Text variant="caption">Sin ejemplares</Text>}
      {copies.map((c) => (
        <ListRow key={c.id} compact>
          <Column variant="id" text={`#${c.id}`} />
          <Column
            variant="subtitled"
            text={c.bookTitle}
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
      ))}
      <FieldError>{error}</FieldError>
    </View>
  );
}
