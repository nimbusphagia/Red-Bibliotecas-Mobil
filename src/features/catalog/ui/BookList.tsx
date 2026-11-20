import type { BookSort } from "@/features/catalog/internal/book/schemas";
import { listBooks } from "@/features/catalog/internal/book/service";
import {
  Button,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import type { SortDirection } from "@/features/shared/types/types";
import { useCallback, useState } from "react";
import { View } from "react-native";
import BookRow from "./list/books/BookRow";
import FilterPanel, {
  toBookParams,
  type CatalogFilters,
  type FilterDialog,
} from "./list/searchFilters/FilterPanel";
import QuickFilters from "./list/searchFilters/QuickFilters";
import { Link } from "expo-router";
import { NotebookPen } from "lucide-react-native";

const PAGE_SIZE = 20;

const SORTS: SortOption<BookSort>[] = [
  { key: "title", label: "Título", defaultDir: "asc" },
  { key: "author", label: "Autor", defaultDir: "asc" },
  { key: "publisher", label: "Editorial", defaultDir: "asc" },
];

export default function BookList() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const [sort, setSort] = useState<{ by: BookSort; dir: SortDirection }>({
    by: "title",
    dir: "asc",
  });

  const debouncedSearch = useDebounce(search);

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
        lead={
          <Link href="/catalog/form" asChild>
            <Button title="Registrar" icon={NotebookPen} />
          </Link>
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
            <QuickFilters filters={filters} onOpen={setDialog} />
            <View className="flex-row items-center gap-4">
              <InlineSort
                options={SORTS}
                sortBy={sort.by}
                sortDir={sort.dir}
                onChange={(by, dir) => setSort({ by, dir })}
              />
            </View>
          </>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(book) => <BookRow book={book} />}
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
