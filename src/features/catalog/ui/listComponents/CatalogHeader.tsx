import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { NotebookPen } from "lucide-react-native";
import { View } from "react-native";
import FilterPanel, { type CatalogFilters } from "./searchFilters/FilterPanel";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
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
    <PageHeader title="Libros">
      <View className="flex-1 flex-row justify-between pl-5">
        <Link href="/catalog/form" asChild>
          <Button
            title="Registrar"
            variant="pill"
            className="bg-highlight"
            lucideIcon={<NotebookPen size={18} color={colors.bg} />}
          />
        </Link>
        <View className="flex-1 flex-row items-center justify-end gap-5">
          <Searchbar
            value={search}
            onChangeText={onSearchChange}
            placeholder="Buscar por título, autor o editorial..."
          />
          <FilterPanel filters={filters} onChange={onFiltersChange} />
        </View>
      </View>
    </PageHeader>
  );
}
