// shared/components/list/DetailRows.tsx
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
  const labelClass =
    variant === "box"
      ? "w-[28%]"
      : n > 1
        ? "w-[28%] text-left"
        : "w-[40%] text-left";

  return (
    <View className={cn("flex-row items-start gap-2", n === 1 && "max-w-xl")}>
      {groups.map((group, i) => (
        <View key={i} className="flex-1 gap-2">
          {group.map((r, j) => (
            <LabeledItem
              key={`${r.label}-${j}`}
              {...r}
              variant={variant}
              labelClass={labelClass}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
