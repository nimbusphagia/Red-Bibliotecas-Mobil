import {
  Button,
  Column,
  FieldError,
  PillRow,
  Text,
} from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
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
      {copies.length === 0 && <Text variant="subtitle">Sin ejemplares</Text>}
      {copies.map((c) => (
        <PillRow key={c.id} className="items-center gap-4 py-1">
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
              icon={<Trash size={14} strokeWidth={3} color={colors.primary} />}
              onPress={() => onRemove(c.id)}
            />
          </Column>
        </PillRow>
      ))}
      <FieldError>{error}</FieldError>
    </View>
  );
}
