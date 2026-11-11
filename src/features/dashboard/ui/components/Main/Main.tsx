import { View } from "react-native";
import DashboardStats from "../Stats/Stats";
import ActiveLoans from "../ActiveLoans/ActiveLoans";
import { Text } from "@/ui/components";

type Props = {};
export default function DashboardMain({}: Props) {
  const sectionClass = "flex";
  return (
    <View className="flex flex-col py-8  gap-10">
      <View className={`${sectionClass}`}>
        <DashboardStats />
      </View>
      <View className={`${sectionClass} flex-row`}>
        <ActiveLoans loans={[]} />
        <View className="w-[300] border-l border-foreground rounded-lg bg-foreground py-4 px-8 h-[400]">
          <Text className="text-primary text-[18px] font-bold">
            {" "}
            Placeholder
          </Text>
        </View>
      </View>
    </View>
  );
}
