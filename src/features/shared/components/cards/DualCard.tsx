import { View } from "react-native";
import { Text } from "../base/Text";
import { Card } from "./Card";
type Stat = {
  name: string;
  numberData: number;
};
type Props = {
  title: string;
  positiveStat: Stat;
  negativeStat: Stat;
};
export function DualCard({ title, positiveStat, negativeStat }: Props) {
  return (
    <Card title={title}>
      <View className="flex flex-row gap-5">
        <StatComponent stat={positiveStat} />
        <StatComponent stat={negativeStat} />
      </View>
    </Card>
  );
}

type StatComponentProps = {
  stat: Stat;
};
function StatComponent({ stat }: StatComponentProps) {
  return (
    <View className="flex items-center">
      <Text className="text-[28px] text-highlight font-bold">
        {stat.numberData}
      </Text>
      <Text className="text-primary">{stat.name}</Text>
    </View>
  );
}
