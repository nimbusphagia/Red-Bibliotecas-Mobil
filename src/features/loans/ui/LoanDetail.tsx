import { useSession } from "@/features/account/internal/session";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";
import { getLoan, listLoanLines } from "@/features/loans/internal/loan/service";
import type {
  LoanLine,
  LoanListItem,
} from "@/features/loans/internal/loan/types";
import { getVisitorItem } from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  Button,
  DetailColumns,
  PageHeader,
  Panel,
  StatusIndicator,
  type DetailRow,
} from "@/features/shared/components";
import {
  gradeLabel,
  LOAN_STATE_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { Link } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { loanStateOf } from "../internal/loan/rules";
import LoanLines from "./loans/detail/LoanLines";
import { LOAN_STATE_ACCENT, LOAN_STATE_ICON } from "./loans/stateIcon";
import { loanDetailRows } from "./loans/detail/loanRows";
import { ScreenBody } from "@/features/shared/layout/Screen";

type Data = { loan: LoanListItem; lines: LoanLine[]; visitor: VisitorListItem };

export default function LoanDetail({ id }: { id: string }) {
  const session = useSession();
  const { data, reload } = useFocusData(
    useCallback(async (): Promise<Data> => {
      const loanId = routeIdSchema.parse(id);
      const loan = await getLoan(loanId);
      const [page, visitor] = await Promise.all([
        listLoanLines({ loanId, limit: 100 }),
        getVisitorItem(loan.loanedToId),
      ]);
      return { loan, lines: page.items, visitor };
    }, [id]),
  );

  if (!data) return <ActivityIndicator />;

  if (session.status !== "signed-in") return null;

  const { loan, lines, visitor } = data;
  const state = loanStateOf(loan);

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
      <PageHeader title={`Préstamo #${loan.id}`}>
        <View className="flex-1 flex-row">
          <StatusIndicator
            text={LOAN_STATE_ES[state]}
            icon={LOAN_STATE_ICON[state]}
            accent={LOAN_STATE_ACCENT[state]}
          />
        </View>
      </PageHeader>
      <ScreenBody>
        <DetailColumns
          columns={[
            { title: "Detalles", rows: loanDetailRows(loan) },
            {
              title: "Prestado a",
              lead: (
                <Link href={`/visitors/${visitor.id}`} asChild>
                  <Button
                    icon={ArrowUpRight}
                    variant="soft"
                    className="bg-transparent"
                  />
                </Link>
              ),
              rows: visitorRows,
            },
          ]}
        />
        <Panel
          title="Ejemplares"
          className="flex-1"
          lead={
            <View className="flex-1 flex-row">
              <StatusIndicator
                text={`${loan.lineCount - loan.openCount} / ${loan.lineCount}`}
              />
            </View>
          }
        >
          <LoanLines
            lines={lines}
            overdue={loan.overdue}
            actorId={session.account.id}
            canManageStock={canManageStock(session.account.role)}
            onChanged={reload}
          />
        </Panel>
      </ScreenBody>
    </>
  );
}
