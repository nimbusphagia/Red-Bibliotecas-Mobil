import { listLabels } from "@/features/inventory/internal/label/service";
import { listShelves } from "@/features/inventory/internal/shelf/service";
import { listLoans } from "@/features/loans/internal/loan/service";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export type DashboardStats = {
  loans: { onTime: number; overdue: number };
  labels: { printed: number; pending: number };
  unplaced: number;
};

async function loadStats(): Promise<DashboardStats> {
  const [open, overdue, printed, pending, shelves] = await Promise.all([
    listLoans({ state: "open", limit: 1 }),
    listLoans({ state: "overdue", limit: 1 }),
    listLabels({ printStatus: "printed", limit: 1 }),
    listLabels({ printStatus: "pending_print", limit: 1 }),
    listShelves({ limit: 100 }),
  ]);
  return {
    loans: { onTime: open.total - overdue.total, overdue: overdue.total },
    labels: { printed: printed.total, pending: pending.total },
    unplaced: shelves.items.find((s) => s.isDefault)?.copyCount ?? 0,
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>();

  useFocusEffect(
    useCallback(() => {
      let stale = false;
      loadStats()
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
