import { View } from "react-native";
import ActiveLoans from "./activeLoans/ActiveLoans";
import DashboardStats from "./stats/Stats";

export default function DashboardMain() {
  return (
    <View className="gap-8">
      <DashboardStats />
      <ActiveLoans />
    </View>
  );
}
