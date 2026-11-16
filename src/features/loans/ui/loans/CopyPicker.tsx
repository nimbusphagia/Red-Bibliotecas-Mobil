import { listBooks } from "@/features/catalog/internal/book/service";
import FilterPanel, {
  toBookParams,
  type CatalogFilters,
  type FilterDialog,
} from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import QuickFilters from "@/features/catalog/ui/list/searchFilters/QuickFilters";
import { ItemList, Searchbar, type Option } from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { cn } from "@/features/shared/theme";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import PickerBook from "./PickerBook";

const PAGE_SIZE = 20;

type Props = {
  selected: Option[];
  onAdd: (option: Option) => void;
  className?: string;
};

export default function CopyPicker({ selected, onAdd, className }: Props) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>({});
  const [dialog, setDialog] = useState<FilterDialog>(null);
  const debouncedSearch = useDebounce(search);

  const fetchPage = useCallback(
    (offset: number) =>
      listBooks({
        ...toBookParams(filters),
        search: debouncedSearch,
        active: true,
        limit: PAGE_SIZE,
        offset,
      }),
    [filters, debouncedSearch],
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
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          open={dialog}
          onOpenChange={setDialog}
        />
      </View>
      <ItemList
        toolbar={
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <QuickFilters filters={filters} onOpen={setDialog} />
          </ScrollView>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(book) => (
          <PickerBook book={book} selected={selected} onAdd={onAdd} />
        )}
      />
    </View>
  );
}
