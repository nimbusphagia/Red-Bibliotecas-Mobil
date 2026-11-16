import { Button } from "@/features/shared/components";
import { View } from "react-native";
import type { CatalogFilters, FilterDialog } from "./FilterPanel";

type Props = {
  filters: CatalogFilters;
  onOpen: (dialog: FilterDialog) => void;
};

export default function QuickFilters({ filters, onOpen }: Props) {
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
      label: "Categoría",
      active: filters.categoryId !== undefined,
    },
    {
      field: "subcategory",
      label: "Subcategoría",
      active: filters.subcategoryId !== undefined,
    },
  ] as const;

  return (
    <View className="flex-row gap-2">
      {buttons.map(({ field, label, active }) => (
        <Button
          key={field}
          title={label}
          variant={active ? "highlight" : "secondary"}
          onPress={() => onOpen(field)}
        />
      ))}
    </View>
  );
}
