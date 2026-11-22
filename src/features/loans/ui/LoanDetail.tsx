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
  PageHeader,
  Panel,
  StatusIndicator,
  type DetailRow,
} from "@/features/shared/components";
import { formatISO } from "@/features/shared/format/dates";
import {
  gradeLabel,
  LOAN_STATE_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { loanStateOf } from "../internal/loan/rules";
import LoanLines from "./loans/detail/LoanLines";
import { loanDetailRows } from "./loans/detail/loanRows";
import { ScreenBody } from "@/features/shared/layout/Screen";

type Data = { loan: LoanListItem; lines: LoanLine[]; visitor: VisitorListItem };

export default function LoanDetail({ id }: { id: string }) {
  const [data, setData] = useState<Data | null>(null);
  const session = useSession();

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
        title={`Préstamo #${loan.id}`}
        lead={<StatusIndicator text={LOAN_STATE_ES[loanStateOf(loan)]} />}
      />
      <ScreenBody>
        <DetailColumns
          columns={[
            { title: "Detalles", rows: loanDetailRows(loan) },
            { title: "Prestado a", rows: visitorRows },
          ]}
        />
        <Panel
          title="Ejemplares"
          className="flex-1"
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
        </Panel>
      </ScreenBody>
    </>
  );
}
