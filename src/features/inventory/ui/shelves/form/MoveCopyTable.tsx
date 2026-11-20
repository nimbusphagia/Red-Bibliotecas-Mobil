import {
  Button,
  Column,
  FieldError,
  ListRow,
  Text,
} from "@/features/shared/components";
import { Trash } from "lucide-react-native";
import { View } from "react-native";
import type { MoveCopy } from "../options";

type Props = {
  copies: MoveCopy[];
  targetId?: number;
  error?: string;
  onRemove: (id: number) => void;
};

export default function MoveCopyTable({
  copies,
  targetId,
  error,
  onRemove,
}: Props) {
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
            subtitle2={
              c.shelfId === targetId
                ? "Ya está en el destino"
                : `Desde: ${c.shelfName}`
            }
          />
          <Column variant="actions" expand={false}>
            <Button
              variant="secondary"
              icon={Trash}
              onPress={() => onRemove(c.id)}
            />
          </Column>
        </ListRow>
      ))}
      <FieldError>{error}</FieldError>
    </View>
  );
}
