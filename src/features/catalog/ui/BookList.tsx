import type { BookSort } from "@/features/catalog/internal/book/schemas";
import { listBooks } from "@/features/catalog/internal/book/service";
import {
  Button,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import {
  PAGE_SIZE,
  useSearch,
  useSort,
} from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { useCallback, useState } from "react";
import { View } from "react-native";
import BookCard from "./list/BookCard";
import FilterPanel, {
  PANEL_FIELDS,
  toBookParams,
  type CatalogFilters,
  type FilterDialog,
} from "./list/searchFilters/FilterPanel";
import QuickFilters from "./list/searchFilters/QuickFilters";
import { Link } from "expo-router";
import { Plus, Stamp } from "lucide-react-native";

const SORTS: SortOption<BookSort>[] = [
  { key: "title", label: "Título", defaultDir: "asc" },
  { key: "author", label: "Autor", defaultDir: "asc" },
  { key: "publisher", label: "Editorial", defaultDir: "asc" },
];

export default function BookList() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const [sort, setSort] = useSort<BookSort>({ by: "title", dir: "asc" });
  const { isExpanded } = useLayoutMode();

  const fetchPage = useCallback(
    (offset: number) => {
      return listBooks({
        ...toBookParams(filters),
        search: debouncedSearch,
        active: true,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      });
    },
    [filters, debouncedSearch, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <PageHeader
        title="Libros"
        subtitle="Cataloga y explora tu biblioteca"
        lead={
          <View className="flex-row gap-2">
            <Link href="/catalog/label" asChild>
              <Button icon={Stamp} size="sm" title="Tejuelos" weight="md" />
            </Link>
            <Link href="/catalog/form" asChild>
              <Button icon={Plus} size="sm" title="Nuevo" weight="md" />
            </Link>
          </View>
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por título, autor o editorial...",
        }}
      />
      <ItemList
        toolbar={
          <>
            <QuickFilters
              filters={filters}
              onOpen={setDialog}
              fields={isExpanded ? PANEL_FIELDS : []}
            />
            <View className="flex-row items-center gap-4">
              <InlineSort
                options={SORTS}
                sortBy={sort.by}
                sortDir={sort.dir}
                onChange={setSort}
              />
            </View>
          </>
        }
        items={list.items}
        loading={list.loading}
        error={list.error}
        onEndReached={list.loadMore}
        columns={3}
        compactColumns={2}
        renderItem={(book) => <BookCard book={book} />}
      />
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={dialog}
        onOpenChange={setDialog}
      />
    </>
  );
}
