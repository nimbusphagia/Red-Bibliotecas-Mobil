import { Text } from "@/features/shared/ui/components";
import { View } from "react-native";
import ActiveLoans from "../activeLoans/ActiveLoans";
import DashboardStats from "../stats/Stats";

type Props = {};
export default function DashboardMain({}: Props) {
  const sectionClass = "flex";
  return (
    <View className="flex flex-col py-8  gap-10">
      <View className={`${sectionClass}`}>
        <DashboardStats />
      </View>
      <View className={`${sectionClass} flex-row gap-5`}>
        <View className="w-[25%] border-l border-foreground rounded-lg bg-foreground py-4 px-8 h-[400]">
          <Text className="text-primary text-[18px] font-bold">
            Placeholder
          </Text>
        </View>

        <ActiveLoans loans={[]} />
      </View>
    </View>
  );
}
