import { getDashboardSummary } from "@/features/dashboard/internal/service";
import type { DashboardSummary } from "@/features/dashboard/internal/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardSummary>();

  useFocusEffect(
    useCallback(() => {
      let stale = false;
      getDashboardSummary()
        .then((s) => {
          if (!stale) setStats(s);
        })
        .catch(() => {});
      return () => {
        stale = true;
      };
    }, []),
  );

  return stats;
}
