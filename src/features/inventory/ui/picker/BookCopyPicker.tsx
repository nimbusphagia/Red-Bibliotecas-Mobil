import { listBooks } from "@/features/catalog/internal/book/service";
import type { BookListParams } from "@/features/catalog/internal/book/schemas";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import FilterPanel, {
  toBookParams,
  type CatalogFilters,
  type FilterDialog,
  type FilterField,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import { ItemList, Searchbar } from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { cn } from "@/features/shared/theme";
import { useCallback, useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import BookCopiesRow from "./BookCopiesRow";

const PAGE_SIZE = 10;

type Props<T extends { id: number }> = {
  selected: T[];
  onToggle: (item: T) => void;
  className?: string;
  /** Filtros del catálogo que se ofrecen (estantería, autor, etc.). */
  filterFields: FilterField[];
  /** Filtros fijos de la lista de libros (activos, con pendientes...). */
  bookParams?: BookListParams;
  /** Controles extra junto a los filtros, que condicionan `bookParams`/`loadCopies`. */
  toolbarExtra?: ReactNode;
  /** Cambia cuando los chips abiertos deben recargarse. */
  reloadKey?: unknown;
  /** Chips de un libro. `byId` indica que se llegó buscando por #id. */
  loadCopies: (
    book: BookListItem,
    ctx: { shelfId?: number; byId: boolean },
  ) => Promise<CopyItem[]>;
  toItem: (copy: CopyItem, book: BookListItem) => T;
  chipDetail?: (copy: CopyItem) => string | undefined;
  /** El libro que contiene al ejemplar con ese #id, si existe y sirve. */
  bookOfCopy: (copyId: number) => Promise<BookListItem | null>;
  subtitle?: (book: BookListItem) => string | undefined;
  /** Texto sin ejemplares; puede depender de la estantería filtrada. */
  emptyText?: string | ((shelfId?: number) => string);
};

/**
 * Selector de ejemplares agrupados por libro: buscador, búsqueda por #id,
 * filtros y una lista de libros que se abren para elegir ejemplares.
 */
export default function BookCopyPicker<T extends { id: number }>({
  selected,
  onToggle,
  className,
  filterFields,
  bookParams,
  toolbarExtra,
  reloadKey,
  loadCopies,
  toItem,
  chipDetail,
  bookOfCopy,
  subtitle,
  emptyText,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [idText, setIdText] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const debouncedSearch = useDebounce(search);
  const copyId = useDebounce(idText);
  const fixed = JSON.stringify(bookParams ?? {});

  const fetchPage = useCallback(
    async (offset: number) => {
      if (copyId) {
        const found = await bookOfCopy(Number(copyId));
        const items = found ? [found] : [];
        return { items, total: items.length, limit: PAGE_SIZE, offset };
      }
      return listBooks({
        ...toBookParams(filters),
        ...(JSON.parse(fixed) as BookListParams),
        search: debouncedSearch,
        limit: PAGE_SIZE,
        offset,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, debouncedSearch, copyId, fixed],
  );
  const list = useInfiniteList(fetchPage);
  const byId = !!copyId;

  return (
    <View className={cn("gap-3", className)}>
      <View className="h-12 flex-row items-center gap-3">
        <Searchbar
          className="w-auto flex-1"
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por título, autor o editorial..."
        />
        <Searchbar
          className="w-28"
          value={idText}
          onChangeText={(t) => setIdText(t.replace(/\D/g, ""))}
          placeholder="#ID"
        />
      </View>
      <ItemList
        gap
        toolbarSurface={false}
        tone="light"
        toolbar={
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-4">
              <QuickFilters
                filters={filters}
                onOpen={setDialog}
                fields={filterFields}
                showPanel={false}
              />
              {toolbarExtra}
            </View>
          </ScrollView>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(book) => (
          <BookCopiesRow
            book={book}
            selected={selected}
            onToggle={onToggle}
            loadCopies={(b) =>
              loadCopies(b, { shelfId: byId ? undefined : filters.shelfId, byId })
            }
            reloadKey={`${String(reloadKey)}|${filters.shelfId}|${byId}`}
            toItem={toItem}
            chipDetail={chipDetail}
            subtitle={subtitle?.(book)}
            emptyText={
              typeof emptyText === "function"
                ? emptyText(byId ? undefined : filters.shelfId)
                : emptyText
            }
            defaultOpen={byId}
          />
        )}
      />
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={dialog}
        onOpenChange={setDialog}
        fields={filterFields}
      />
    </View>
  );
}
