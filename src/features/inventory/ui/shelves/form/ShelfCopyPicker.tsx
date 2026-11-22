import { listBooks } from "@/features/catalog/internal/book/service";
import FilterPanel, {
  type CatalogFilters,
  type FilterDialog,
  type FilterField,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import { ItemList, Searchbar } from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { cn } from "@/features/shared/theme";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { copyByIdForMove, type MoveCopy } from "../options";
import MovePickerBook from "./MovePickerBook";

const PAGE_SIZE = 10;
const PICKER_FIELDS: FilterField[] = ["shelf"];

type Props = {
  selected: MoveCopy[];
  onToggle: (copy: MoveCopy) => void;
  className?: string;
};

export default function ShelfCopyPicker({
  selected,
  onToggle,
  className,
}: Props) {
  const [search, setSearch] = useState("");
  const [idText, setIdText] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const shelfId = filters.shelfId;
  const debouncedSearch = useDebounce(search);
  const copyId = useDebounce(idText);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (copyId) {
        const found = await copyByIdForMove(Number(copyId));
        const items = found ? [found.book] : [];
        return { items, total: items.length, limit: PAGE_SIZE, offset };
      }
      return listBooks({
        search: debouncedSearch,
        shelfId,
        limit: PAGE_SIZE,
        offset,
      });
    },
    [debouncedSearch, shelfId, copyId],
  );
  const list = useInfiniteList(fetchPage);

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
        toolbar={
          <QuickFilters
            filters={filters}
            onOpen={setDialog}
            fields={PICKER_FIELDS}
            showPanel={false}
          />
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(book) => (
          <MovePickerBook
            book={book}
            shelfId={copyId ? undefined : shelfId}
            selected={selected}
            onToggle={onToggle}
            defaultOpen={!!copyId}
          />
        )}
      />
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={dialog}
        onOpenChange={setDialog}
        fields={PICKER_FIELDS}
      />
    </View>
  );
}
