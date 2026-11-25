import {
  Button,
  Column,
  FieldError,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { Pencil, ShelvingUnit, Trash } from "lucide-react-native";
import { View } from "react-native";
import {
  lineAuthors,
  lineErrorText,
  lineQuantity,
  lineShelf,
  lineTitle,
  type EntryLine,
} from "./lines";

const copiesText = (n: number) => `${n} ${n === 1 ? "ejemplar" : "ejemplares"}`;

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
  const { isCompact } = useLayoutMode();
  return (
    <View className="gap-2">
      {lines.length === 0 && (
        <View className="min-h-24 items-center justify-center">
          <Text variant="caption">Sin libros</Text>
        </View>
      )}
      {lines.map((l, i) => {
        const problem = lineErrorText(l);
        return (
          <View key={l.key} className="gap-1">
            <ListRow compact>
              <Column
                variant="subtitled"
                text={lineTitle(l) || "Sin título"}
                subtitle1={lineAuthors(l)}
                containerClass="flex-[2]"
              />
              <Column containerClass="gap-2">
                <Icon icon={ShelvingUnit} />
                <Text variant="itemSm" className="shrink" numberOfLines={1}>
                  {lineShelf(l)?.label}
                </Text>
              </Column>
              {!isCompact && (
                <Column
                  text={l.kind === "new" ? "Libro nuevo" : "Libro existente"}
                />
              )}
              <Column
                text={
                  isCompact
                    ? String(lineQuantity(l))
                    : copiesText(lineQuantity(l))
                }
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
