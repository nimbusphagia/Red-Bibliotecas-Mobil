import type {
  CopyBookSort,
  CopyListParams,
} from "@/features/inventory/internal/copy/schemas";
import { listCopyBooks } from "@/features/inventory/internal/copy/service";
import {
  Button,
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  Searchbar,
  type SortOption,
} from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { PAGE_SIZE, useSearch, useSort } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { useCallback, useMemo, useState } from "react";
import FilterPanel, {
  type CatalogFilters,
  type FilterDialog,
  type FilterField,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import CopyBookRow from "./copies/list/CopyBookRow";
import { Link } from "expo-router";
import { Stamp } from "lucide-react-native";
import { View } from "react-native";

type StatusFilter = "all" | "labeled" | "pending" | "outdated";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "labeled", label: "Etiquetados" },
  { value: "pending", label: "Faltantes" },
  { value: "outdated", label: "Desactualizados" },
];

const FILTER_FIELDS: FilterField[] = ["shelf"];

const SORTS: SortOption<CopyBookSort>[] = [
  { key: "title", label: "Título", defaultDir: "asc" },
  { key: "author", label: "Autor", defaultDir: "asc" },
];

type Props = {
  initialSearch?: string;
};

export default function CopyList({ initialSearch }: Props) {
  const { isExpanded } = useLayoutMode();
  const { search, setSearch, debouncedSearch } = useSearch(initialSearch);
  const [idText, setIdText] = useState("");
  const copyId = useDebounce(idText);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const [sort, setSort] = useSort<CopyBookSort>({ by: "title", dir: "asc" });

  const copyFilters = useMemo<CopyListParams>(
    () => ({
      search: debouncedSearch,
      copyId: copyId ? Number(copyId) : undefined,
      labeled:
        filter === "labeled" ? true : filter === "pending" ? false : undefined,
      outdated: filter === "outdated" ? true : undefined,
      shelfId: filters.shelfId,
    }),
    [debouncedSearch, copyId, filter, filters.shelfId],
  );

  const fetchPage = useCallback(
    (offset: number) =>
      listCopyBooks({
        ...copyFilters,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [copyFilters, sort],
  );

  const list = useInfiniteList(fetchPage);
  const searching = !!debouncedSearch || !!copyId;

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
        searchExtra={
          <Searchbar
            className={isExpanded ? "w-28" : "h-10 w-28"}
            value={idText}
            onChangeText={(t) => setIdText(t.replace(/\D/g, ""))}
            placeholder="#ID"
          />
        }
      />
      <ItemList
        toolbar={
          <>
            <View className="flex-row items-center gap-4">
              <QuickFilters
                filters={filters}
                onOpen={setDialog}
                fields={[]}
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
        renderItem={(book) => (
          <CopyBookRow
            book={book}
            filters={copyFilters}
            defaultOpen={searching}
          />
        )}
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
