import type { VisitorSort } from "@/features/loans/internal/visitor/schemas";
import { listVisitors } from "@/features/loans/internal/visitor/service";
import type { VisitorRole } from "@/features/loans/internal/visitor/types";
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
import { UserRoundPlus } from "lucide-react-native";
import { useCallback, useState } from "react";
import VisitorDialog from "./visitors/form/VisitorDialog";
import VisitorCard from "./visitors/list/VisitorCard";

type Filter = "all" | VisitorRole;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "student", label: "Estudiantes" },
  { value: "teacher", label: "Profesores" },
];

const SORTS: SortOption<VisitorSort>[] = [
  { key: "name", label: "Nombre", defaultDir: "asc" },
  { key: "createdAt", label: "Fecha de registro", defaultDir: "desc" },
];

export default function VisitorList() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useSort<VisitorSort>({ by: "name", dir: "asc" });
  const [adding, setAdding] = useState(false);


  const fetchPage = useCallback(
    (offset: number) =>
      listVisitors({
        search: debouncedSearch,
        role: filter === "all" ? undefined : filter,
        active: true,
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
        title="Visitantes"
        subtitle="Estudiantes y profesores"
        lead={
          <Button
            title="Agregar"
            size="sm"
            weight="md"
            icon={UserRoundPlus}
            onPress={() => setAdding(true)}
          />
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por nombre...",
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
        columns={4}
        compactColumns={3}
        renderItem={(visitor) => <VisitorCard visitor={visitor} />}
      />
      {adding && (
        <VisitorDialog
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            list.reload();
          }}
        />
      )}
    </>
  );
}
