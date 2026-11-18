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
  Text,
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
import LoanLines from "./loans/detail/LoanLines";
import { cn, colors } from "@/features/shared/theme";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { Dot } from "lucide-react-native";
import { useSession } from "@/features/account/internal/session";
import { loanStateOf } from "../internal/loan/rules";

type Data = { loan: LoanListItem; lines: LoanLine[]; visitor: VisitorListItem };
type Row = { label: string; content: string };

const Rows = ({ rows }: { rows: Row[] }) => (
  <View className="max-w-xl gap-2">
    {rows.map((r, i) => (
      <>
        <LabeledItem key={i} {...r} labelClass="w-[40%] text-left" />
      </>
    ))}
  </View>
);

export default function LoanDetail({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);
  const session = useSession();
  const { isExpanded } = useLayoutMode();

  const load = useCallback(async () => {
    const loanId = routeIdSchema.parse(id);
    const loan = await getLoan(loanId);
    const [page, visitor] = await Promise.all([
      listLoanLines({ loanId, limit: 100 }),
      getVisitorItem(loan.loanedToId),
    ]);
    setData({ loan, lines: page.items, visitor });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!data) return <ActivityIndicator />;

  if (session.status !== "signed-in") return null;

  const { loan, lines, visitor } = data;

  const state = loanStateOf(loan);
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
      <PageHeader
        title={`Prestamo #${loan.id}`}
        lead={
          <View className="flex-row gap-2 items-center">
            <Dot size={16} strokeWidth={3} color={colors.primary} />
            <Text variant="h3">{LOAN_STATE_ES[loanStateOf(loan)]}</Text>
          </View>
        }
      />
      <ScrollView className="flex-1" contentContainerClassName="gap-6 p-4">
        <View className={cn("gap-6", isExpanded && "flex-row")}>
          <Section title="Prestado a" expand={isExpanded}>
            <Rows rows={visitorRows} />
          </Section>
          <Section title="Detalles" expand={isExpanded}>
            <Rows rows={rows} />
          </Section>
        </View>
        <Section
          title="Ejemplares"
          expand
          lead={
            <View className="flex-row gap-2 items-center">
              <Dot size={16} strokeWidth={3} color={colors.primary} />
              <Text variant="h3" className="font-sans-semibold">
                {loan.lineCount - loan.openCount} / {loan.lineCount}
              </Text>
            </View>
          }
        >
          <LoanLines
            lines={lines}
            actorId={session.account.id}
            onChanged={load}
          />
        </Section>
      </ScrollView>
    </>
  );
}
