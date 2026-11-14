import { listBooks } from "@/features/catalog/internal/book/service";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useCallback, useState } from "react";
import CatalogHeader from "./listComponents/CatalogHeader";
import CatalogMain from "./listComponents/CatalogMain";
import type { CatalogFilters } from "./listComponents/searchFilters/FilterPanel";

const PAGE_SIZE = 20;

export default function Catalog() {
  const [search, setSearch] = useState("");
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
      />
      <CatalogMain list={list} />
    </>
  );
}
