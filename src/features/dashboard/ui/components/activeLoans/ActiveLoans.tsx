import { listLoans } from "@/features/loans/internal/loan/service";
import type {
  LoanListItem,
  LoanState,
} from "@/features/loans/internal/loan/types";
import LoanRow from "@/features/loans/ui/loans/list/LoanRow";
import {
  Button,
  InlineFilter,
  Panel,
  Text,
} from "@/features/shared/components";
import { Link, useFocusEffect } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

const LIMIT = 10;

type Filter = Exclude<LoanState, "closed">;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Activos" },
  { value: "overdue", label: "Vencidos" },
];

export default function ActiveLoans() {
  const [loans, setLoans] = useState<LoanListItem[]>();
  const [filter, setFilter] = useState<Filter>("open");

  useFocusEffect(
    useCallback(() => {
      let stale = false;
      listLoans({
        state: filter,
        sortBy: "expiresBy",
        sortDir: "asc",
        limit: LIMIT,
      })
        .then((p) => {
          if (!stale) setLoans(p.items);
        })
        .catch(() => {});
      return () => {
        stale = true;
      };
    }, [filter]),
  );

  return (
    <Panel
      className="p-4 gap-4"
      title="Préstamos pendientes"
      lead={
        <View className="flex-1 flex-row items-center justify-between">
          <InlineFilter options={FILTERS} value={filter} onChange={setFilter} />
          <Link href="/loans" asChild>
            <Button icon={ArrowUpRight} className="bg-transparent" />
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
          className="h-[300]"
          contentContainerClassName="gap-2.5"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {loans.map((l) => (
            <LoanRow key={l.id} loan={l} inset={true} external />
          ))}
        </ScrollView>
      )}
    </Panel>
  );
}
