import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

export type Stat = {
  name: string;
  numberData: number | string;
};

type Props = { stat: Stat; highlight?: boolean };

export function StatTile({ stat, highlight }: Props) {
  return (
    <View
      className={cn(
        "min-w-[110px] items-start gap-1 rounded-lg border px-4 py-2",
        highlight ? "border-primary bg-primary" : "border-fg1 bg-fg1/60",
      )}
    >
      <Text variant="display" className={cn(highlight && "text-bg")}>
        {stat.numberData}
      </Text>
      <Text variant="caption" className={cn(highlight && "text-bg")}>
        {stat.name}
      </Text>
    </View>
  );
}
