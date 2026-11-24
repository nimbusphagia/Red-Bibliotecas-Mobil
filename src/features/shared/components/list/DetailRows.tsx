import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import type { AccentLevel } from "../../theme";
import { LabeledItem, type LabeledItemVariant } from "./LabeledItem";

export type DetailRow = {
  label: string;
  content?: string;
  accent?: AccentLevel;
  muted?: boolean;
};
export type DetailRowsVariant = LabeledItemVariant;

type Props = {
  rows: DetailRow[];
  variant?: DetailRowsVariant;
  columns?: 1 | 2;
};

export function DetailRows({ rows, variant = "pill", columns = 1 }: Props) {
  const { isExpanded } = useLayoutMode();
  const n = isExpanded ? columns : 1;
  const visible = isExpanded ? rows : rows.filter((r) => r.content);
  const size = Math.ceil(visible.length / n);
  const groups = Array.from({ length: n }, (_, i) =>
    visible.slice(i * size, (i + 1) * size),
  );
  const labelWidth = variant === "pill" && n === 1 ? "wide" : "narrow";

  return (
    <View className="flex-row items-start gap-6 ">
      {groups.map((group, i) => (
        <View key={i} className="flex-1 gap-2.5">
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
