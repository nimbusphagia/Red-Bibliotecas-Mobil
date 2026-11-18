import { View } from "react-native";
import { LabeledItem } from "./LabeledItem";

export type DetailRow = { label: string; content: string };

export function DetailRows({ rows }: { rows: DetailRow[] }) {
  return (
    <View className="max-w-xl gap-2">
      {rows.map((r) => (
        <LabeledItem key={r.label} {...r} labelClass="w-[40%] text-left" />
      ))}
    </View>
  );
}
