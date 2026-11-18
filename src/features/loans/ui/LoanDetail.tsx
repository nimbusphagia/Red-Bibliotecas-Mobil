import { getLoan, listLoanLines } from "@/features/loans/internal/loan/service";
import type {
  LoanLine,
  LoanListItem,
} from "@/features/loans/internal/loan/types";
import { getVisitorItem } from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  LabeledItem,
  LabeledItem2,
  PageHeader,
  Section,
} from "@/features/shared/components";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import {
  gradeLabel,
  LOAN_STATE_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import LoanLines from "./detail/LoanLines";
import { cn } from "@/features/shared/theme";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";

type Data = { loan: LoanListItem; lines: LoanLine[]; visitor: VisitorListItem };
type Row = { label: string; content: string };

const Rows = ({ rows, square }: { rows: Row[]; square?: boolean }) => (
  <View className="max-w-xl gap-2">
    {rows.map((r) => (
      <>
        {square ? (
          <LabeledItem2
            key={r.label}
            {...r}
            labelClass="w-[40%] text-left"
            contentClass="text-right"
          />
        ) : (
          <LabeledItem key={r.label} {...r} labelClass="w-[40%] text-left" />
        )}
      </>
    ))}
  </View>
);

export default function LoanDetail({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);
  const { isExpanded } = useLayoutMode();

  useFocusEffect(
    useCallback(() => {
      const loanId = routeIdSchema.parse(id);
      let cancelled = false;
      getLoan(loanId)
        .then(async (loan) => {
          const [page, visitor] = await Promise.all([
            listLoanLines({ loanId, limit: 100 }),
            getVisitorItem(loan.loanedToId),
          ]);
          return { loan, lines: page.items, visitor };
        })
        .then((d) => !cancelled && setData(d));
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  if (!data) return <ActivityIndicator />;
  const { loan, lines, visitor } = data;

  const state =
    loan.openCount === 0 ? "closed" : loan.overdue ? "overdue" : "open";
  const visitorRows: Row[] = [
    { label: "Nombre", content: visitor.name },
    { label: "Rol", content: ROLE_ES[visitor.role] },
    ...(visitor.role === "student"
      ? [
          {
            label: "Grado",
            content: gradeLabel(visitor.grade!, visitor.level!),
          },
        ]
      : []),
  ];
  const rows: Row[] = [
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
        <View className={cn("gap-6", isExpanded && "flex-row")}>
          <Section title="Prestado a" expand={isExpanded}>
            <Rows rows={visitorRows} />
          </Section>
          <Section title="Detalles" expand={isExpanded}>
            <Rows rows={rows} />
          </Section>
        </View>
        <Section title="Ejemplares" expand>
          <LoanLines lines={lines} />
        </Section>
      </ScrollView>
    </>
  );
}
