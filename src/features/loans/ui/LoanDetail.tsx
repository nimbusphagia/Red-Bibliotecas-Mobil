import { getLoan, listLoanLines } from "@/features/loans/internal/loan/service";
import type {
  LoanLine,
  LoanListItem,
} from "@/features/loans/internal/loan/types";
import {
  LabeledItem,
  LabeledItem2,
  PageHeader,
  PairedRow,
  Section,
} from "@/features/shared/components";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { LOAN_STATE_ES } from "@/features/shared/format/translate";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import LoanLines from "./detail/LoanLines";

type Data = { loan: LoanListItem; lines: LoanLine[] };

export default function LoanDetail({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loanId = routeIdSchema.parse(id);
      let cancelled = false;
      Promise.all([
        getLoan(loanId),
        listLoanLines({ loanId, limit: 100 }),
      ]).then(([loan, page]) => {
        if (!cancelled) setData({ loan, lines: page.items });
      });
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  if (!data) return <ActivityIndicator />;
  const { loan, lines } = data;

  const state =
    loan.openCount === 0 ? "closed" : loan.overdue ? "overdue" : "open";
  const rows = [
    { label: "Prestado a", content: loan.visitorName },
    { label: "Estado", content: LOAN_STATE_ES[state] },
    { label: "Encargado", content: loan.loanedByUsername },
    { label: "Inicio", content: formatDate(loan.createdAt) },
    { label: "Fecha de devolucion", content: formatISO(loan.expiresBy) },
    { label: "Notas", content: loan.notes ?? "---" },
  ];

  return (
    <>
      <PageHeader title={`Prestamo #${loan.id}`} />
      <ScrollView className="flex-1" contentContainerClassName="gap-6 p-4">
        <Section title="Detalles">
          <View className="max-w-xl gap-2">
            {rows.map((r) => (
              <LabeledItem2
                key={r.label}
                {...r}
                labelClass="w-[40%] text-left"
              />
            ))}
          </View>
        </Section>
        <Section title="Ejemplares" expand>
          <LoanLines lines={lines} />
        </Section>
      </ScrollView>
    </>
  );
}
