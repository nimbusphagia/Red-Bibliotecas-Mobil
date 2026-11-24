import {
  ActiveCounter,
  Button,
  type Option,
} from "@/features/shared/components";
import { SlidersHorizontal } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import {
  loadCategories,
  loadShelves,
  loadSubcategories,
  useOptions,
} from "../../options";
import {
  PANEL_FIELDS,
  type CatalogFilters,
  type FilterDialog,
  type FilterField,
} from "./FilterPanel";

type Props = {
  filters: CatalogFilters;
  onOpen: (dialog: FilterDialog) => void;
  fields?: FilterField[];
  showPanel?: boolean;
  /** Filtros activos que no están en `filters`. */
  extraCount?: number;
};

export default function QuickFilters({
  filters,
  onOpen,
  fields = PANEL_FIELDS,
  showPanel = true,
  extraCount = 0,
}: Props) {
  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined,
  ).length + extraCount;
  const categories = useOptions(loadCategories);
  const subcategories = useOptions(loadSubcategories);
  const shelves = useOptions(loadShelves);
  const labelOf = (options: Option[], id?: number) =>
    options.find((o) => o.id === id)?.label;

  const all: { field: FilterField; label: string; active: boolean }[] = [
    {
      field: "author",
      label: filters.author?.label ?? "Autor",
      active: !!filters.author,
    },
    {
      field: "publisher",
      label: filters.publisher?.label ?? "Editorial",
      active: !!filters.publisher,
    },
    {
      field: "category",
      label: labelOf(categories, filters.categoryId) ?? "Categoría",
      active: filters.categoryId !== undefined,
    },
    {
      field: "subcategory",
      label: labelOf(subcategories, filters.subcategoryId) ?? "Subcategoría",
      active: filters.subcategoryId !== undefined,
    },
    {
      field: "shelf",
      label: labelOf(shelves, filters.shelfId) ?? "Estantería",
      active: filters.shelfId !== undefined,
    },
  ];
  const buttons = all.filter((b) => fields.includes(b.field));

  return (
    <View className="shrink flex-row items-center gap-4">
      {showPanel && (
        <View>
          <Button
            variant="solid"
            weight="lg"
            size="sm"
            icon={SlidersHorizontal}
            onPress={() => onOpen("all")}
          />
          {activeCount > 0 && <ActiveCounter count={activeCount} />}
        </View>
      )}
      {buttons.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="shrink grow-0"
          contentContainerStyle={{ gap: 8 }}
        >
          {buttons.map(({ field, label, active }) => (
            <Button
              key={field}
              title={label}
              variant={active ? "accent" : "selector"}
              size="sm"
              onPress={() => onOpen(field)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
