import {
  Button,
  Column,
  FieldError,
  ListRow,
  Text,
} from "@/features/shared/components";
import { Pencil, Trash } from "lucide-react-native";
import { View } from "react-native";
import {
  lineErrorText,
  lineQuantity,
  lineShelf,
  lineTitle,
  type EntryLine,
} from "./lines";

type Props = {
  lines: EntryLine[];
  error?: string;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

export default function EntryLineTable({
  lines,
  error,
  onEdit,
  onRemove,
}: Props) {
  return (
    <View className="gap-2">
      {lines.length === 0 && <Text variant="caption">Sin libros</Text>}
      {lines.map((l, i) => {
        const problem = lineErrorText(l);
        return (
          <View key={l.key} className="gap-1">
            <ListRow compact>
              <Column variant="id" text={String(lineQuantity(l))} />
              <Column
                variant="subtitled"
                text={lineTitle(l) || "Sin título"}
                subtitle1={l.kind === "new" ? "Libro nuevo" : "Libro existente"}
                subtitle2={lineShelf(l)?.label}
              />
              <Column variant="actions" expand={false}>
                <Button
                  variant="soft"
                  icon={Pencil}
                  onPress={() => onEdit(i)}
                />
                <Button
                  variant="soft"
                  icon={Trash}
                  onPress={() => onRemove(i)}
                />
              </Column>
            </ListRow>
            <FieldError>{problem}</FieldError>
          </View>
        );
      })}
      <FieldError>{error}</FieldError>
    </View>
  );
}
