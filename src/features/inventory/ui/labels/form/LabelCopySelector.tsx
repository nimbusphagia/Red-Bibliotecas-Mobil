import FilterPanel, {
  type CatalogFilters,
  type FilterDialog,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import { listCopyBooks } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  FieldError,
  InlineFilter,
  ItemList,
  Panel,
  Searchbar,
} from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { PAGE_SIZE, useSearch } from "@/features/shared/hooks/useListControls";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { CircleDashedCheck } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { LABEL_STATE_ES } from "@/features/shared/format/translate";
import CopyBookGroup, {
  RemoteCopyBookGroup,
  groupCopies,
  type BookHeader,
} from "../../picker/CopyBookGroup";
import { LABEL_STATE_ICON, labelStateOf } from "../labelState";

type Mode = "selected" | "all" | "needsLabel";

const MODES: { value: Mode; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "needsLabel", label: "Por etiquetar" },
];

type Match = {
  search: string;
  copyId?: number;
  shelfId?: number;
};

const matches = (c: CopyItem, m: Match) => {
  const text = `${c.bookTitle} ${c.labelText ?? ""}`.toLowerCase();
  return (
    (m.copyId === undefined || c.id === m.copyId) &&
    (m.shelfId === undefined || c.shelfId === m.shelfId) &&
    m.search
      .toLowerCase()
      .split(/\s+/)
      .every((token) => text.includes(token))
  );
};

const stateOf = (c: CopyItem) => {
  const state = labelStateOf(c);
  return { icon: LABEL_STATE_ICON[state], text: LABEL_STATE_ES[state] };
};

type Props = {
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  error?: string;
  /** Recibe la carga de la página siguiente, para el scroll de la pantalla. */
  loadMoreRef: RefObject<(() => void) | undefined>;
};

/** Ejemplares agrupados por libro; se tocan para elegirlos. */
export default function LabelCopySelector({
  selected,
  onToggle,
  error,
  loadMoreRef,
}: Props) {
  const [mode, setMode] = useState<Mode>("needsLabel");
  const { search, setSearch, debouncedSearch } = useSearch();
  const [idText, setIdText] = useState("");
  const copyId = useDebounce(idText);
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const { isExpanded } = useLayoutMode();

  const match = useMemo(
    () => ({
      search: debouncedSearch,
      copyId: isExpanded && copyId ? Number(copyId) : undefined,
      shelfId: filters.shelfId,
    }),
    [debouncedSearch, copyId, isExpanded, filters.shelfId],
  );
  const copyMatch = useMemo(
    () => ({
      ...match,
      needsLabel: mode === "needsLabel" ? true : undefined,
    }),
    [match, mode],
  );

  const fetchPage = useCallback(
    (offset: number) =>
      mode === "selected"
        ? Promise.resolve({ items: [], total: 0, limit: PAGE_SIZE, offset })
        : listCopyBooks({
            ...copyMatch,
            hasCopies: true,
            limit: PAGE_SIZE,
            offset,
          }),
    [mode, copyMatch],
  );
  const list = useInfiniteList<BookHeader>(fetchPage);

  useEffect(() => {
    loadMoreRef.current = list.loadMore;
  }, [loadMoreRef, list.loadMore]);

  const local = useMemo(
    () => (mode === "selected" ? groupCopies(selected, (c) => matches(c, match)) : []),
    [mode, selected, match],
  );

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
                <InlineFilter options={MODES} value={mode} onChange={setMode} />
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
                placeholder="Buscar por título o tejuelo..."
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
            />
          ) : (
            <RemoteCopyBookGroup
              book={book}
              match={copyMatch}
              selected={selected}
              onToggle={onToggle}
              stateOf={stateOf}
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
        fields={["shelf"]}
      />
    </Panel>
  );
}
