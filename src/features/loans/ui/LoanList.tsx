import type { LoanSort } from "@/features/loans/internal/loan/schemas";
import { listLoans } from "@/features/loans/internal/loan/service";
import type { LoanState } from "@/features/loans/internal/loan/types";
import {
  Button,
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import { PAGE_SIZE, useSearch, useSort } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { Link } from "expo-router";
import { ArrowUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import LoanRow from "./loans/list/LoanRow";

type Filter = "all" | LoanState;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Activos" },
  { value: "overdue", label: "Vencidos" },
  { value: "closed", label: "Finalizados" },
];

const SORTS: SortOption<LoanSort>[] = [
  { key: "createdAt", label: "Fecha de préstamo", defaultDir: "desc" },
  { key: "expiresBy", label: "Vencimiento", defaultDir: "asc" },
];

export default function LoanList() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useSort<LoanSort>({ by: "createdAt", dir: "desc" });


  const fetchPage = useCallback(
    (offset: number) =>
      listLoans({
        search: debouncedSearch,
        state: filter === "all" ? undefined : filter,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [debouncedSearch, filter, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <PageHeader
        title="Préstamos"
        subtitle="Registra y da seguimiento a los ejemplares prestados"
        lead={
          <Link href="/loans/new" asChild>
            <Button title="Nuevo" icon={ArrowUp} size="sm" weight="md" />
          </Link>
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por visitante...",
        }}
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
              sortBy={sort.by}
              sortDir={sort.dir}
              onChange={setSort}
            />
          </>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(loan) => <LoanRow loan={loan} />}
      />
    </>
  );
}
