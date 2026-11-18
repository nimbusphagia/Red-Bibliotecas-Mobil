import type { LineStatus } from "@/features/loans/internal/loan/schemas";
import { listVisitorLines } from "@/features/loans/internal/loan/service";
import { getVisitorItem } from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  Text,
  type SortOption,
} from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import type { SortDirection } from "@/features/shared/types/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import VisitorLineRow from "./visitors/detail/VisitorLineRow";

const PAGE_SIZE = 20;

type Filter = "all" | LineStatus;

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
  const [visitor, setVisitor] = useState<VisitorListItem | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  useFocusEffect(
    useCallback(() => {
      getVisitorItem(visitorId).then(setVisitor);
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

  if (!visitor) return <ActivityIndicator />;

  return (
    <>
      <PageHeader
        title={visitor.name}
        lead={
          <Text variant="subtitle">
            {ROLE_ES[visitor.role]}
            {visitor.role === "student" &&
              ` · ${gradeLabel(visitor.grade!, visitor.level!)}`}
          </Text>
        }
      />
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
    </>
  );
}
