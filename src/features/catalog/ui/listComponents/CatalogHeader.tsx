import type { BookSort } from "@/features/catalog/internal/book/schemas";
import { Button } from "@/features/shared/components";
import Header from "@/features/shared/components/header/Header";
import Searchbar from "@/features/shared/components/search/Searchbar";
import { colors } from "@/features/shared/theme";
import type { SortDirection } from "@/features/shared/types/types";
import { NotebookPen } from "lucide-react-native";
import { View } from "react-native";
import FilterPanel, { type CatalogFilters } from "./searchFilters/FilterPanel";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  sortBy: BookSort;
  sortDir: SortDirection;
  onSortChange: (sortBy: BookSort, sortDir: SortDirection) => void;
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
};
export default function CatalogHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: Props) {
  return (
    <Header title="Libros">
      <View className="flex-1 flex-row justify-between pl-5">
        <Button
          title="Registrar"
          variant="pill"
          className="bg-highlight"
          lucideIcon={<NotebookPen size={18} color={colors.bg} />}
        />
        <View className="flex-1 flex-row items-center justify-end gap-5">
          <Searchbar
            value={search}
            onChangeText={onSearchChange}
            placeholder="Buscar por título, autor o editorial..."
          />
          {/*<SortMenu sortBy={sortBy} sortDir={sortDir} onChange={onSortChange} />*/}
          <FilterPanel filters={filters} onChange={onFiltersChange} />
        </View>
      </View>
    </Header>
  );
}
