import { listLoans } from "@/features/loans/internal/loan/service";
import type { LoanSort } from "@/features/loans/internal/loan/schemas";
import type { LoanState } from "@/features/loans/internal/loan/types";
import {
  Button,
  InlineFilter,
  ItemList,
  InlineSort,
  type SortOption,
} from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { colors } from "@/features/shared/theme";
import type { SortDirection } from "@/features/shared/types/types";
import { Link } from "expo-router";
import { SquarePlus } from "lucide-react-native";
import { useCallback, useState } from "react";
import ListHeader from "../ListHeader";
import LoanRow from "./LoanRow";

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
      <ListHeader
        title="Préstamos"
        create={
          <Link href="/loans/new" asChild>
            <Button
              variant="highlight"
              title="Nuevo"
              icon={<SquarePlus size={18} color={colors.bg} />}
            />
          </Link>
        }
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por visitante..."
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
