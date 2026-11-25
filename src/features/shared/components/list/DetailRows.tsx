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
  /** También en vertical: mismas columnas y sin ocultar los vacíos. */
  fixed?: boolean;
};

export function DetailRows({
  rows,
  variant = "pill",
  columns = 1,
  fixed,
}: Props) {
  const { isExpanded } = useLayoutMode();
  const full = isExpanded || !!fixed;
  const n = full ? columns : 1;
  const visible = full ? rows : rows.filter((r) => r.content && !r.muted);
  const size = Math.ceil(visible.length / n);
  const groups = Array.from({ length: n }, (_, i) =>
    visible.slice(i * size, (i + 1) * size),
  );
  const labelWidth =
    variant === "pill" && n === 1 ? "wide" : isExpanded ? "narrow" : "half";

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
