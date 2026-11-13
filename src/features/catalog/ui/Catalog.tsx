import type { BookSort } from "@/features/catalog/internal/book/schemas";
import { listBooks } from "@/features/catalog/internal/book/service";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import type { SortDirection } from "@/features/shared/types/types";
import { useCallback, useState } from "react";
import CatalogHeader from "./listComponents/CatalogHeader";
import CatalogMain from "./listComponents/CatalogMain";
import type { CatalogFilters } from "./listComponents/searchFilters/FilterPanel";

const PAGE_SIZE = 20;

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<BookSort>("title");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<CatalogFilters>({});

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
        sortBy,
        sortDir,
        active: true,
        limit: PAGE_SIZE,
        offset,
      }),
    [filters, debouncedSearch, sortBy, sortDir],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <CatalogHeader
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(by, dir) => {
          setSortBy(by);
          setSortDir(dir);
        }}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <CatalogMain list={list} />
    </>
  );
}
