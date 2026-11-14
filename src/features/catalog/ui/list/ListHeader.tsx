import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { NotebookPen } from "lucide-react-native";
import FilterPanel, { type CatalogFilters } from "./searchFilters/FilterPanel";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
};
export default function ListHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: Props) {
  return (
    <PageHeader
      title="Libros"
      lead={
        <Link href="/catalog/form" asChild>
          <Button
            title="Registrar"
            icon={<NotebookPen size={18} color={colors.bg} />}
          />
        </Link>
      }
    >
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Buscar por título, autor o editorial..."
      />
      <FilterPanel filters={filters} onChange={onFiltersChange} />
    </PageHeader>
  );
}
