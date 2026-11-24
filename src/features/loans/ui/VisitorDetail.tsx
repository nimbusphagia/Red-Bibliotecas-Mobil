import {
  getVisitorLoanStatus,
  listLoans,
} from "@/features/loans/internal/loan/service";
import type {
  LoanState,
  VisitorLoanStatus,
} from "@/features/loans/internal/loan/types";
import type { LineHistory } from "@/features/loans/internal/visitor/reputation";
import {
  getVisitorHistory,
  getVisitorItem,
} from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  DetailColumns,
  InlineFilter,
  ItemList,
  PageHeader,
  Panel,
  type DetailRow,
} from "@/features/shared/components";
import { REPUTATION_ES } from "@/features/shared/format/translate";
import { PAGE_SIZE } from "@/features/shared/hooks/useListControls";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import LoanRow from "./loans/list/LoanRow";
import { visitorRoleLabel } from "./visitors/visitorRows";

type Filter = "all" | LoanState;
type Data = {
  visitor: VisitorListItem;
  status: VisitorLoanStatus;
  history: LineHistory;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Activos" },
  { value: "overdue", label: "Vencidos" },
  { value: "closed", label: "Finalizados" },
];

const countRow = (label: string, n: number): DetailRow => ({
  label,
  content: String(n),
  muted: n === 0,
});

export default function VisitorDetail({ id }: { id: string }) {
  const visitorId = routeIdSchema.parse(id);
  const [filter, setFilter] = useState<Filter>("all");

  const { data } = useFocusData(
    useCallback(async (): Promise<Data> => {
      const [visitor, status, history] = await Promise.all([
        getVisitorItem(visitorId),
        getVisitorLoanStatus(visitorId),
        getVisitorHistory(visitorId),
      ]);
      return { visitor, status, history };
    }, [visitorId]),
  );

  const fetchPage = useCallback(
    (offset: number) =>
      listLoans({
        visitorId,
        state: filter === "all" ? undefined : filter,
        sortBy: "createdAt",
        sortDir: "desc",
        limit: PAGE_SIZE,
        offset,
      }),
    [visitorId, filter],
  );

  const list = useInfiniteList(fetchPage);

  if (!data) return <ActivityIndicator />;

  const { visitor, status, history } = data;

  const summaryRows: DetailRow[] = [
    { label: "Reputación", content: REPUTATION_ES[visitor.reputation] },
    countRow("Total prestados", visitor.lineCount),
    countRow("Préstamos activos", status.open),
    {
      ...countRow("Vencidos", status.overdue),
      accent: status.overdue > 0 ? "neg" : undefined,
    },
    countRow("Devueltos tarde", history.late),
    countRow("Perdidos", history.lost),
  ];

  return (
    <>
      <PageHeader title={visitor.name} subtitle={visitorRoleLabel(visitor)} />
      <DetailColumns
        columns={[{ title: "Resumen", rows: summaryRows, columns: 2 }]}
      />
      <Panel title="Historial de préstamos" className="flex-1">
        <ItemList
          toolbarSurface={false}
          toolbar={
            <InlineFilter
              options={FILTERS}
              value={filter}
              onChange={setFilter}
            />
          }
          items={list.items}
          loading={list.loading}
          onEndReached={list.loadMore}
          renderItem={(loan) => <LoanRow loan={loan} hideVisitor />}
        />
      </Panel>
    </>
  );
}
