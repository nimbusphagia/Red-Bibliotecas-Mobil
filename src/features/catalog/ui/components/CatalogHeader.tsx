import type { BookSort } from "@/features/catalog/internal/book/schemas";
import type { SortDirection } from "@/features/shared/types/types";
import { Button } from "@/features/shared/ui/components";
import Header from "@/features/shared/ui/components/header/Header";
import Searchbar from "@/features/shared/ui/components/search/Searchbar";
import { colors } from "@/features/shared/ui/utils";
import { NotebookPen } from "lucide-react-native";
import { View } from "react-native";
import FilterPanel, { type CatalogFilters } from "./FilterPanel";
import SortMenu from "./SortMenu";

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
  sortBy,
  sortDir,
  onSortChange,
  filters,
  onFiltersChange,
}: Props) {
  return (
    <Header title="Libros">
      <View className="flex-1 flex-row justify-between px-5">
        <Button
          title="Registrar"
          variant="pill"
          lucideIcon={<NotebookPen size={18} color={colors.background} />}
        />
        <View className="flex-1 flex-row items-center justify-end gap-5">
          <Searchbar
            value={search}
            onChangeText={onSearchChange}
            placeholder="Buscar por título, autor o editorial..."
          />
          <SortMenu sortBy={sortBy} sortDir={sortDir} onChange={onSortChange} />
          <FilterPanel filters={filters} onChange={onFiltersChange} />
        </View>
      </View>
    </Header>
  );
}
