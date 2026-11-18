import { listBooks } from "@/features/catalog/internal/book/service";
import FilterPanel, {
  toBookParams,
  type CatalogFilters,
  type FilterDialog,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import { ItemList, Searchbar } from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { cn } from "@/features/shared/theme";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { copyById, type LoanCopy } from "../../options";
import PickerBook from "./PickerBook";

const PAGE_SIZE = 10;

type Props = {
  selected: LoanCopy[];
  onToggle: (copy: LoanCopy) => void;
  className?: string;
};

export default function CopyPicker({ selected, onToggle, className }: Props) {
  const [search, setSearch] = useState("");
  const [idText, setIdText] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const debouncedSearch = useDebounce(search);
  const copyId = useDebounce(idText);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (copyId) {
        const found = await copyById(Number(copyId));
        const items = found ? [found.book] : [];
        return { items, total: items.length, limit: PAGE_SIZE, offset };
      }
      return listBooks({
        ...toBookParams(filters),
        search: debouncedSearch,
        active: true,
        limit: PAGE_SIZE,
        offset,
      });
    },
    [filters, debouncedSearch, copyId],
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
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          open={dialog}
          onOpenChange={setDialog}
        />
      </View>
      <ItemList
        toolbar={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            <QuickFilters filters={filters} onOpen={setDialog} />
          </ScrollView>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(book) => (
          <PickerBook
            book={book}
            selected={selected}
            onToggle={onToggle}
            defaultOpen={!!copyId}
          />
        )}
      />
    </View>
  );
}
