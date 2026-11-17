import {
  Button,
  Column,
  FieldError,
  PillRow,
  Text,
} from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { X } from "lucide-react-native";
import { View } from "react-native";
import type { LoanCopy } from "../options";

type Props = {
  copies: LoanCopy[];
  error?: string;
  onRemove: (id: number) => void;
};

export default function CopyTable({ copies, error, onRemove }: Props) {
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
            subtitle2={c.author || undefined}
          />
          <Column variant="actions" expand={false}>
            <Button
              variant="secondary"
              icon={<X size={16} color={colors.highlight} />}
              onPress={() => onRemove(c.id)}
            />
          </Column>
        </PillRow>
      ))}
      <FieldError>{error}</FieldError>
    </View>
  );
}
