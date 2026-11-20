import { View } from "react-native";
import ActiveLoans from "./activeLoans/ActiveLoans";
import DashboardStats from "./stats/Stats";

export default function DashboardMain() {
  return (
    <View className="flex flex-col gap-10 py-8">
      <DashboardStats />
      <ActiveLoans />
    </View>
  );
}
