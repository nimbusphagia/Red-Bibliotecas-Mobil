import { useDashboardStats } from "@/features/dashboard/ui/useDashboardStats";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { ActivityIndicator, View } from "react-native";
import ActiveLoans from "./activeLoans/ActiveLoans";
import CollectionStatus from "./charts/CollectionStatus";
import MonthlyLoans from "./charts/MonthlyLoans";
import Metrics from "./metrics/Metrics";

export default function DashboardMain() {
  const stats = useDashboardStats();
  const { isExpanded } = useLayoutMode();

  if (!stats) return <ActivityIndicator />;

  const side = (
    <View className="gap-3">
      <CollectionStatus copies={stats.copies} />
      <Metrics summary={stats} />
    </View>
  );

  return isExpanded ? (
    <View className="flex-row items-start gap-6 pt-2">
      <View className="w-[300px]">{side}</View>
      <View className="flex-1 gap-6">
        <MonthlyLoans months={stats.monthlyLoans} />
        <ActiveLoans />
      </View>
    </View>
  ) : (
    <View className="gap-6">
      {side}
      <MonthlyLoans months={stats.monthlyLoans} />
      <ActiveLoans />
    </View>
  );
}
