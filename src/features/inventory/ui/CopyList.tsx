import type { CopySort } from "@/features/inventory/internal/copy/schemas";
import { listCopies } from "@/features/inventory/internal/copy/service";
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
import { useCallback, useState } from "react";
import FilterPanel, {
  type CatalogFilters,
  type FilterDialog,
  type FilterField,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import CopyRow from "./copies/list/CopyRow";
import { Link } from "expo-router";
import { Stamp } from "lucide-react-native";
import { View } from "react-native";

type StatusFilter = "all" | "labeled" | "pending" | "outdated";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "labeled", label: "Etiquetados" },
  { value: "pending", label: "Sin etiquetar" },
  { value: "outdated", label: "Desactualizados" },
];

const FILTER_FIELDS: FilterField[] = ["shelf"];

const SORTS: SortOption<CopySort>[] = [
  { key: "labeledAt", label: "Fecha de etiquetado", defaultDir: "desc" },
  { key: "createdAt", label: "Fecha de creación", defaultDir: "desc" },
];

export default function CopyList() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const [sort, setSort] = useSort<CopySort>({ by: "labeledAt", dir: "desc" });


  const fetchPage = useCallback(
    (offset: number) =>
      listCopies({
        search: debouncedSearch,
        labeled:
          filter === "labeled"
            ? true
            : filter === "pending"
              ? false
              : undefined,
        outdated: filter === "outdated" ? true : undefined,
        excludeReleased: true,
        shelfId: filters.shelfId,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [debouncedSearch, filter, filters.shelfId, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <PageHeader
        title="Ejemplares"
        subtitle="Seguimiento de ejemplares y tejuelos"
        lead={
          <Link href="/copies/mark" asChild>
            <Button title="Tejuelos" icon={Stamp} size="sm" weight="md" />
          </Link>
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por título o tejuelo...",
        }}
      />
      <ItemList
        toolbar={
          <>
            <View className="flex-row items-center gap-4">
              <QuickFilters
                filters={filters}
                onOpen={setDialog}
                fields={FILTER_FIELDS}
                showPanel={false}
              />
              <InlineFilter
                options={FILTERS}
                value={filter}
                onChange={setFilter}
              />
            </View>
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
        renderItem={(copy) => <CopyRow copy={copy} />}
      />
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={dialog}
        onOpenChange={setDialog}
        fields={FILTER_FIELDS}
      />
    </>
  );
}
