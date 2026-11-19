import { View } from "react-native";
import { LabeledItem } from "./LabeledItem";
import { LabeledItem2 } from "./LabeledItem2";

export type DetailRow = { label: string; content: string };
export type DetailRowsVariant = "pill" | "box";

const ITEMS = { pill: LabeledItem, box: LabeledItem2 };

type Props = { rows: DetailRow[]; variant?: DetailRowsVariant };

export function DetailRows({ rows, variant = "pill" }: Props) {
  const Item = ITEMS[variant];
  return (
    <View className="max-w-xl gap-2">
      {rows.map((r) => (
        <Item key={r.label} {...r} labelClass="w-[40%] text-left" />
      ))}
    </View>
  );
}
