import type { LineStatus } from "@/features/loans/internal/loan/schemas";
import {
  getVisitorLoanStatus,
  listVisitorLines,
} from "@/features/loans/internal/loan/service";
import type { VisitorLoanStatus } from "@/features/loans/internal/loan/types";
import { getVisitorItem } from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  DetailColumns,
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  Panel,
  type DetailRow,
  type SortOption,
} from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { PAGE_SIZE } from "@/features/shared/hooks/useListControls";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import type { SortDirection } from "@/features/shared/types/types";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import VisitorLineRow from "./visitors/detail/VisitorLineRow";

type Filter = "all" | LineStatus;
type Data = { visitor: VisitorListItem; status: VisitorLoanStatus };

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "returned", label: "Devueltos" },
  { value: "returned_damaged", label: "Dañados" },
  { value: "lost", label: "Perdidos" },
];

const SORTS: SortOption<"createdAt">[] = [
  { key: "createdAt", label: "Fecha de creación", defaultDir: "desc" },
];

export default function VisitorDetail({ id }: { id: string }) {
  const visitorId = routeIdSchema.parse(id);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const { data } = useFocusData(
    useCallback(async (): Promise<Data> => {
      const [visitor, status] = await Promise.all([
        getVisitorItem(visitorId),
        getVisitorLoanStatus(visitorId),
      ]);
      return { visitor, status };
    }, [visitorId]),
  );

  const fetchPage = useCallback(
    (offset: number) =>
      listVisitorLines({
        visitorId,
        status: filter === "all" ? undefined : filter,
        sortDir,
        limit: PAGE_SIZE,
        offset,
      }),
    [visitorId, filter, sortDir],
  );

  const list = useInfiniteList(fetchPage);

  if (!data) return <ActivityIndicator />;

  const { visitor, status } = data;

  const detailRows: DetailRow[] = [
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
  const summaryRows: DetailRow[] = [
    { label: "Activos", content: String(status.open) },
    { label: "Total prestados", content: String(visitor.lineCount) },
    { label: "Préstamos vencidos", content: String(status.overdue) },
    { label: "Infracciones", content: String(visitor.problemCount) },
  ];

  return (
    <>
      <PageHeader title={`${visitor.name}`} />
      <DetailColumns
        columns={[
          { title: "Resumen", rows: summaryRows },
          { title: "Detalles", rows: detailRows },
        ]}
      />
      <Panel title="Historial de préstamos" className="flex-1">
        <ItemList
          toolbar={
            <>
              <InlineFilter
                options={FILTERS}
                value={filter}
                onChange={setFilter}
              />
              <InlineSort
                options={SORTS}
                sortBy="createdAt"
                sortDir={sortDir}
                onChange={(_, dir) => setSortDir(dir)}
              />
            </>
          }
          items={list.items}
          loading={list.loading}
          onEndReached={list.loadMore}
          renderItem={(line) => <VisitorLineRow line={line} />}
        />
      </Panel>
    </>
  );
}
