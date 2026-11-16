import { listBooks } from "@/features/catalog/internal/book/service";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useCallback, useState } from "react";
import CatalogHeader from "./list/ListHeader";
import CatalogMain from "./list/ListMain";
import { View } from "react-native";
import type {
  CatalogFilters,
  FilterDialog,
} from "./list/searchFilters/FilterPanel";
import QuickFilters from "./list/searchFilters/QuickFilters";

const PAGE_SIZE = 20;

export default function BookList() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);

  const debouncedSearch = useDebounce(search);

  const fetchPage = useCallback(
    (offset: number) =>
      listBooks({
        authorId: filters.author?.id,
        publisherId: filters.publisher?.id,
        seriesId: filters.series?.id,
        categoryId: filters.categoryId,
        subcategoryId: filters.subcategoryId,
        collectionId: filters.collectionId,
        search: debouncedSearch,
        active: true,
        limit: PAGE_SIZE,
        offset,
      }),
    [filters, debouncedSearch],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <CatalogHeader
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        dialog={dialog}
        onDialogChange={setDialog}
      />
      <View className="px-4 pt-2 ">
        <QuickFilters filters={filters} onOpen={setDialog} />
      </View>
      <CatalogMain list={list} />
    </>
  );
}
