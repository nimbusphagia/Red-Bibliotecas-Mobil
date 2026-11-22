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
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import type { SortDirection } from "@/features/shared/types/types";
import { Link } from "expo-router";
import { ArrowUp, BookUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import LoanRow from "./loans/list/LoanRow";

const PAGE_SIZE = 20;

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<{ by: LoanSort; dir: SortDirection }>({
    by: "createdAt",
    dir: "desc",
  });

  const debouncedSearch = useDebounce(search);

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
              onChange={(by, dir) => setSort({ by, dir })}
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
