import {
  Button,
  Column,
  FieldError,
  ListRow,
  Text,
} from "@/features/shared/components";
import { Minus } from "lucide-react-native";
import { View } from "react-native";
import type { LoanCopy } from "../../options";

type Props = {
  copies: LoanCopy[];
  error?: string;
  onRemove: (id: number) => void;
};

export default function CopyTable({ copies, error, onRemove }: Props) {
  return (
    <View className="gap-2">
      {copies.length === 0 && <Text variant="caption">Sin ejemplares</Text>}
      {copies.map((c) => (
        <ListRow key={c.id} compact>
          <Column variant="id" text={`#${c.id}`} />
          <Column
            variant="subtitled"
            text={c.title}
            subtitle1={c.labelText ?? undefined}
            subtitle2={c.author || undefined}
          />
          <Column variant="actions" expand={false}>
            <Button
              variant="soft"
              icon={Minus}
              onPress={() => onRemove(c.id)}
            />
          </Column>
        </ListRow>
      ))}
      <FieldError>{error}</FieldError>
    </View>
  );
}
