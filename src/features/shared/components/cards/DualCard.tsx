import { View } from "react-native";
import { Card } from "./Card";
import { StatTile, type Stat } from "./StatTile";

type Props = {
  title: string;
  positiveStat: Stat;
  negativeStat: Stat;
};

const needsAttention = (s: Stat) =>
  typeof s.numberData === "number" && s.numberData > 0;

export function DualCard({ title, positiveStat, negativeStat }: Props) {
  return (
    <Card title={title} variant="flat">
      <View className="flex-row gap-3">
        <StatTile stat={positiveStat} />
        <StatTile
          stat={negativeStat}
          highlight={needsAttention(negativeStat)}
        />
      </View>
    </Card>
  );
}
