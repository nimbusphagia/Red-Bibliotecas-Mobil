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
import { useSearch } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { cn } from "@/features/shared/theme";
import type { LucideIcon } from "lucide-react-native";
import { useCallback, useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import BookCopiesRow from "./BookCopiesRow";
import { findCopyWithBook } from "./copyWithBook";

const PAGE_SIZE = 10;

type Props<T extends { id: number }> = {
  selected: T[];
  onToggle: (item: T) => void;
  className?: string;
  /** Filtros del catálogo que se ofrecen (estantería, autor, etc.). */
  filterFields: FilterField[];
  /** Solo el botón del panel de filtros, sin los botones rápidos. */
  panelOnly?: boolean;
  /** Filtros fijos de la lista de libros. Debe ser un valor estable (constante o memoizado). */
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
  chipIcon?: (copy: CopyItem) => LucideIcon | undefined;
  /** Descarta ejemplares al buscar por #id (por defecto se aceptan todos). Debe ser estable. */
  acceptCopy?: (copy: CopyItem) => boolean;
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
  panelOnly = false,
  bookParams,
  toolbarExtra,
  reloadKey,
  loadCopies,
  toItem,
  chipDetail,
  chipIcon,
  acceptCopy,
  subtitle,
  emptyText,
}: Props<T>) {
  const { search, setSearch, debouncedSearch } = useSearch();
  const [idText, setIdText] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const copyId = useDebounce(idText);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (copyId) {
        const found = await findCopyWithBook(Number(copyId));
        const items =
          found && (acceptCopy?.(found.copy) ?? true) ? [found.book] : [];
        return { items, total: items.length, limit: PAGE_SIZE, offset };
      }
      return listBooks({
        ...toBookParams(filters),
        ...bookParams,
        search: debouncedSearch,
        limit: PAGE_SIZE,
        offset,
      });
    },
    [filters, debouncedSearch, copyId, bookParams, acceptCopy],
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
                fields={panelOnly ? [] : filterFields}
                showPanel={panelOnly}
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
            chipIcon={chipIcon}
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
