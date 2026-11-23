import { getDashboardSummary } from "@/features/dashboard/internal/service";
import { useFocusData } from "@/features/shared/hooks/useFocusData";

export function useDashboardStats() {
  return useFocusData(getDashboardSummary).data;
}
