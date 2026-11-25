import { listLoans } from "@/features/loans/internal/loan/service";
import type { LoanState } from "@/features/loans/internal/loan/types";
import LoanRow from "@/features/loans/ui/loans/list/LoanRow";
import {
  Button,
  InlineFilter,
  Panel,
  Text,
} from "@/features/shared/components";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { Link } from "expo-router";
import type { AccentLevel } from "@/features/shared/theme";
import { ArrowUpRight } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

const LIMIT = 10;

type Filter = Exclude<LoanState, "closed">;

const FILTERS: { value: Filter; label: string; accent?: AccentLevel }[] = [
  { value: "open", label: "Activos" },
  { value: "overdue", label: "Vencidos", accent: "neg" },
];

export default function ActiveLoans() {
  const [filter, setFilter] = useState<Filter>("open");
  const { data: loans } = useFocusData(
    useCallback(
      () =>
        listLoans({
          state: filter,
          sortBy: "expiresBy",
          sortDir: "asc",
          limit: LIMIT,
        }).then((p) => p.items),
      [filter],
    ),
  );

  return (
    <Panel
      className="p-4 gap-4"
      title="Préstamos pendientes"
      lead={
        <View className="flex-1 flex-row items-center justify-between">
          <InlineFilter options={FILTERS} value={filter} onChange={setFilter} />
          <Link href="/loans" asChild>
            <Button
              icon={ArrowUpRight}
              variant="soft"
              className="bg-transparent"
            />
          </Link>
        </View>
      }
    >
      {!loans ? (
        <ActivityIndicator />
      ) : loans.length === 0 ? (
        <Text variant="caption">No hay préstamos pendientes</Text>
      ) : (
        <ScrollView
          className="min-h-[180] max-h-[360]"
          contentContainerClassName="gap-2.5"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {loans.map((l) => (
            <LoanRow key={l.id} loan={l} inset />
          ))}
        </ScrollView>
      )}
    </Panel>
  );
}
