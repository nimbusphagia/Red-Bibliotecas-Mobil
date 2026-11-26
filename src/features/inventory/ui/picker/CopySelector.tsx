import { listBooks } from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { writersOf } from "@/features/catalog/ui/options";
import FilterPanel, {
  toBookParams,
  type CatalogFilters,
  type FilterDialog,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import CopyBookGroup, {
  RemoteCopyBookGroup,
  groupCopies,
  type BookHeader,
  type CopyState,
} from "./CopyBookGroup";
import { findCopyWithBook } from "./copyWithBook";
import {
  Button,
  FieldError,
  InlineFilter,
  ItemList,
  Panel,
  Searchbar,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { PAGE_SIZE, useSearch } from "@/features/shared/hooks/useListControls";
import {
  CircleCheck,
  CircleDashed,
  CircleDashedCheck,
} from "lucide-react-native";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { ScrollView, View } from "react-native";

type Mode = "selected" | "all" | "available";

const MODES: { value: Mode; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "available", label: "Disponibles" },
];

const toHeader = (b: BookListItem): BookHeader => ({
  id: b.id,
  title: b.title,
  authors: writersOf(b) || null,
  publisherName: b.publisherName,
});

const statusOf = (c: CopyItem) => ({
  icon: c.status === "available" ? CircleCheck : CircleDashed,
  text: COPY_STATUS_ES[c.status],
});

const notAvailable = (c: CopyItem) => c.status !== "available";

type Match = { search: string; copyId?: number; shelfId?: number };

const matches = (c: CopyItem, m: Match) => {
  const text =
    `${c.bookTitle} ${c.authors ?? ""} ${c.publisherName ?? ""} ${c.labelText ?? ""}`.toLowerCase();
  return (
    (m.copyId === undefined || c.id === m.copyId) &&
    (m.shelfId === undefined || c.shelfId === m.shelfId) &&
    m.search
      .toLowerCase()
      .split(/\s+/)
      .every((token) => text.includes(token))
  );
};

type Props = {
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  error?: string;
  /** Recibe la carga de la página siguiente, para el scroll de la pantalla. */
  loadMoreRef: RefObject<(() => void) | undefined>;
  /** Sin el filtro de disponibles: se ofrecen todos los ejemplares activos. */
  anyStatus?: boolean;
  stateOf?: (copy: CopyItem) => CopyState;
  /** Por defecto, los que no están disponibles. */
  disabled?: (copy: CopyItem) => boolean;
};

/** Libros con sus ejemplares; se tocan los disponibles para elegirlos. */
export default function CopySelector({
  selected,
  onToggle,
  error,
  loadMoreRef,
  anyStatus = false,
  stateOf = statusOf,
  disabled = anyStatus ? undefined : notAvailable,
}: Props) {
  const [mode, setMode] = useState<Mode>(anyStatus ? "all" : "available");
  const { search, setSearch, debouncedSearch } = useSearch();
  const [idText, setIdText] = useState("");
  const idDebounced = useDebounce(idText);
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const { isExpanded } = useLayoutMode();
  const copyId = isExpanded && idDebounced ? Number(idDebounced) : undefined;

  const copyMatch = useMemo(
    () => ({
      copyId,
      shelfId: filters.shelfId,
      status: mode === "available" ? ("available" as const) : undefined,
    }),
    [copyId, filters.shelfId, mode],
  );

  const fetchPage = useCallback(
    async (offset: number) => {
      if (mode === "selected")
        return { items: [], total: 0, limit: PAGE_SIZE, offset };
      if (copyId !== undefined) {
        const found = await findCopyWithBook(copyId);
        const items = found ? [toHeader(found.book)] : [];
        return { items, total: items.length, limit: PAGE_SIZE, offset };
      }
      const page = await listBooks({
        ...toBookParams(filters),
        search: debouncedSearch,
        active: true,
        withCopies: mode === "available" ? "available" : "active",
        limit: PAGE_SIZE,
        offset,
      });
      return { ...page, items: page.items.map(toHeader) };
    },
    [mode, copyId, filters, debouncedSearch],
  );
  const list = useInfiniteList<BookHeader>(fetchPage);

  useEffect(() => {
    loadMoreRef.current = list.loadMore;
  }, [loadMoreRef, list.loadMore]);

  const local = useMemo(() => {
    if (mode !== "selected") return [];
    const m = { search: debouncedSearch, copyId, shelfId: filters.shelfId };
    return groupCopies(selected, (c) => matches(c, m));
  }, [mode, selected, debouncedSearch, copyId, filters.shelfId]);

  return (
    <Panel title="Seleccionar">
      <ItemList
        inline
        toolbarSurface={false}
        toolbar={
          <>
            {/* Fuera del ScrollView: si no, recorta el contador del botón. */}
            <QuickFilters
              filters={filters}
              onOpen={setDialog}
              fields={[]}
              light
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="ml-4 shrink grow-0"
            >
              <View className="flex-row items-center gap-4">
                <InlineFilter
                  options={anyStatus ? MODES.slice(0, 1) : MODES}
                  value={mode}
                  onChange={setMode}
                />
                <Button
                  title={isExpanded ? "Seleccionados" : undefined}
                  accessibilityLabel="Seleccionados"
                  icon={CircleDashedCheck}
                  size="sm"
                  variant={mode === "selected" ? "active" : "soft"}
                  onPress={() => setMode("selected")}
                />
              </View>
            </ScrollView>
            <View className="ml-4 h-11 flex-1 flex-row justify-end gap-3">
              <Searchbar
                className="max-w-[300px] flex-1"
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por título, autor o editorial..."
              />
              {isExpanded && (
                <Searchbar
                  className="w-28"
                  value={idText}
                  onChangeText={(t) => setIdText(t.replace(/\D/g, ""))}
                  placeholder="#ID"
                />
              )}
            </View>
          </>
        }
        items={mode === "selected" ? local : list.items}
        loading={mode !== "selected" && list.loading}
        error={mode === "selected" ? null : list.error}
        renderItem={(book) =>
          mode === "selected" ? (
            <CopyBookGroup
              book={book}
              copies={local.find((g) => g.id === book.id)?.copies}
              selected={selected}
              onToggle={onToggle}
              stateOf={stateOf}
              disabled={disabled}
            />
          ) : (
            <RemoteCopyBookGroup
              book={book}
              match={copyMatch}
              selected={selected}
              onToggle={onToggle}
              stateOf={stateOf}
              disabled={disabled}
            />
          )
        }
      />
      <FieldError>{error}</FieldError>
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={dialog}
        onOpenChange={setDialog}
      />
    </Panel>
  );
}
