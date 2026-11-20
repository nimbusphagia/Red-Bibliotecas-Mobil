import { useSession } from "@/features/account/internal/session";
import { getLoan, listLoanLines } from "@/features/loans/internal/loan/service";
import type {
  LoanLine,
  LoanListItem,
} from "@/features/loans/internal/loan/types";
import { getVisitorItem } from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  DetailColumns,
  DetailRow,
  Icon,
  PageHeader,
  Section,
  StatusIndicator,
  Text,
} from "@/features/shared/components";
import { formatISO } from "@/features/shared/format/dates";
import {
  gradeLabel,
  LOAN_STATE_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusEffect } from "expo-router";
import { Dot } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { loanStateOf } from "../internal/loan/rules";
import LoanLines from "./loans/detail/LoanLines";
import { loanDetailRows } from "./loans/detail/loanRows";
import { ScreenBody } from "@/features/shared/layout/Screen";

type Data = { loan: LoanListItem; lines: LoanLine[]; visitor: VisitorListItem };

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

  const visitorRows: DetailRow[] = [
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

  return (
    <>
      <PageHeader
        title={`Prestamo #${loan.id}`}
        lead={<StatusIndicator text={LOAN_STATE_ES[loanStateOf(loan)]} />}
      />
      <ScreenBody>
        <DetailColumns
          columns={[
            { title: "Prestado a", rows: visitorRows },
            { title: "Detalles", rows: loanDetailRows(loan) },
          ]}
        />
        <Section
          title="Ejemplares"
          expand
          lead={
            <StatusIndicator
              text={`${loan.lineCount - loan.openCount} / ${loan.lineCount}`}
            />
          }
        >
          <LoanLines
            lines={lines}
            expiresBy={formatISO(loan.expiresBy)}
            actorId={session.account.id}
            onChanged={load}
          />
        </Section>
      </ScreenBody>
    </>
  );
}
