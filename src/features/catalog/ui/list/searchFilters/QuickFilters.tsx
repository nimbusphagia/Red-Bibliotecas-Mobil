import { Button, type Option } from "@/features/shared/components";
import { loadCategories, loadSubcategories, useOptions } from "../../options";
import { ScrollView, View } from "react-native";
import type { CatalogFilters, FilterDialog } from "./FilterPanel";
import { Circle, SlidersHorizontal } from "lucide-react-native";
import { colors } from "@/features/shared/theme";

type Props = {
  filters: CatalogFilters;
  onOpen: (dialog: FilterDialog) => void;
};

export default function QuickFilters({ filters, onOpen }: Props) {
  const active = Object.values(filters).some((v) => v !== undefined);
  const categories = useOptions(loadCategories);
  const subcategories = useOptions(loadSubcategories);
  const labelOf = (options: Option[], id?: number) =>
    options.find((o) => o.id === id)?.label;

  const buttons = [
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
  ] as const;

  return (
    <View className=" shrink flex-row items-center gap-2">
      <View>
        <Button
          variant="secondary"
          icon={<SlidersHorizontal size={18} color={colors.primary} />}
          onPress={() => onOpen("all")}
        />
        {active && (
          <View
            className="absolute right-0 top-0"
            style={{ pointerEvents: "none" }}
          >
            <Circle
              size={10}
              color={colors.highlight}
              fill={colors.highlight}
            />
          </View>
        )}
      </View>
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
            variant={active ? "highlight" : "secondary"}
            onPress={() => onOpen(field)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
