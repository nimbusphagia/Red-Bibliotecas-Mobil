import { useDashboardStats } from "@/features/dashboard/ui/useDashboardStats";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { ActivityIndicator, View } from "react-native";
import ActiveLoans from "./activeLoans/ActiveLoans";
import CollectionStatus from "./charts/CollectionStatus";
import MonthlyLoans from "./charts/MonthlyLoans";
import {
  DueSoonMetrics,
  LabelMetrics,
  OverdueMetrics,
} from "./metrics/Metrics";

export default function DashboardMain() {
  const stats = useDashboardStats();
  const { isExpanded } = useLayoutMode();

  if (!stats) return <ActivityIndicator />;

  return isExpanded ? (
    <View className="flex-row items-start gap-6 pt-2">
      <View className="flex-1 gap-6">
        <MonthlyLoans months={stats.monthlyLoans} />
        <ActiveLoans />
      </View>
      <View className="w-[300px] gap-3">
        <CollectionStatus copies={stats.copies} />
        <View className="gap-4">
          <OverdueMetrics summary={stats} />
          <LabelMetrics summary={stats} />
          <DueSoonMetrics summary={stats} />
        </View>
      </View>
    </View>
  ) : (
    <View className="gap-6">
      <MonthlyLoans months={stats.monthlyLoans} />
      <ActiveLoans />
      <View className="flex-row gap-4">
        <CollectionStatus copies={stats.copies} className="flex-1" />
        <LabelMetrics summary={stats} className="flex-1" />
      </View>
    </View>
  );
}
