import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn } from "../../theme";
import { LabeledItem, type LabeledItemVariant } from "./LabeledItem";

export type DetailRow = { label: string; content?: string };
export type DetailRowsVariant = LabeledItemVariant;

type Props = {
  rows: DetailRow[];
  variant?: DetailRowsVariant;
  columns?: 1 | 2;
};

export function DetailRows({ rows, variant = "pill", columns = 1 }: Props) {
  const { isExpanded } = useLayoutMode();
  const n = isExpanded ? columns : 1;
  const size = Math.ceil(rows.length / n);
  const groups = Array.from({ length: n }, (_, i) =>
    rows.slice(i * size, (i + 1) * size),
  );
  const labelWidth = variant === "pill" && n === 1 ? "wide" : "narrow";

  return (
    <View className={cn("flex-row items-start gap-6", n === 1 && "max-w-xl")}>
      {groups.map((group, i) => (
        <View key={i} className="flex-1 gap-4">
          {group.map((r, j) => (
            <LabeledItem
              key={`${r.label}-${j}`}
              {...r}
              variant={variant}
              labelWidth={labelWidth}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
