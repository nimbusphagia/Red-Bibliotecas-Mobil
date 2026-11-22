import { listLoans } from "@/features/loans/internal/loan/service";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import LoanRow from "@/features/loans/ui/loans/list/LoanRow";
import { Button, Text } from "@/features/shared/components";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const LIMIT = 6;

export default function ActiveLoans() {
  const [loans, setLoans] = useState<LoanListItem[]>();

  useFocusEffect(
    useCallback(() => {
      let stale = false;
      listLoans({
        state: "open",
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
    }, []),
  );

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="section">Préstamos pendientes</Text>
        <Link href="/loans" asChild>
          <Button variant="soft" title="Ver todos" />
        </Link>
      </View>

      {!loans ? (
        <ActivityIndicator />
      ) : loans.length === 0 ? (
        <Text variant="caption">No hay préstamos pendientes</Text>
      ) : (
        <View className="gap-3">
          {loans.map((l) => (
            <LoanRow key={l.id} loan={l} />
          ))}
        </View>
      )}
    </View>
  );
}
