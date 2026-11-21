import {
  ActiveCounter,
  Button,
  type Option,
} from "@/features/shared/components";
import { SlidersHorizontal } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { loadCategories, loadSubcategories, useOptions } from "../../options";
import type { CatalogFilters, FilterDialog } from "./FilterPanel";

type Props = {
  filters: CatalogFilters;
  onOpen: (dialog: FilterDialog) => void;
};

export default function QuickFilters({ filters, onOpen }: Props) {
  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined,
  ).length;
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
    <View className="shrink flex-row items-center gap-4">
      <View>
        <Button
          variant="solid"
          weight="md"
          iconTone="accent2"
          icon={SlidersHorizontal}
          onPress={() => onOpen("all")}
        />
        {activeCount > 0 && <ActiveCounter count={activeCount} />}
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
            variant={active ? "accent" : "solid"}
            onPress={() => onOpen(field)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
