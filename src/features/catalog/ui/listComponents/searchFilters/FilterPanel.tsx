import { listSeries } from "@/features/catalog/internal/series/service";
import {
  Button,
  Dialog,
  SearchSelect,
  SimpleSelect,
  Text,
  type Option,
} from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Circle, SlidersHorizontal } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  fetchCollections,
  loadCategories,
  loadSubcategories,
  searchAuthors,
  searchPublishers,
  useOptions,
} from "../../options";

export type CatalogFilters = {
  author?: Option;
  publisher?: Option;
  series?: Option;
  categoryId?: number;
  subcategoryId?: number;
  collectionId?: number;
};

const LIMIT = 20;

const fetchAuthors = (s: string) => searchAuthors(s, true);
const fetchPublishers = (s: string) => searchPublishers(s, true);

type Props = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
};

export default function FilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<CatalogFilters>) =>
    onChange({ ...filters, ...patch });
  const active = Object.values(filters).some((v) => v !== undefined);
  const authorId = filters.author?.id;
  const publisherId = filters.publisher?.id;

  const fetchSeries = useCallback(
    async (search: string): Promise<Option[]> =>
      (
        await listSeries({ search, authorId, withBooks: true, limit: LIMIT })
      ).items.map((s) => ({ id: s.id, label: s.name })),
    [authorId],
  );

  const loadCollections = useCallback(
    () => fetchCollections(publisherId, true),
    [publisherId],
  );

  const categories = useOptions(loadCategories);
  const subcategories = useOptions(loadSubcategories);
  const collections = useOptions(publisherId ? loadCollections : null);

  return (
    <>
      <View>
        <Button
          variant="secondary"
          icon={<SlidersHorizontal size={18} color={colors.primary} />}
          onPress={() => setOpen(true)}
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
      {open && (
        <Dialog onClose={() => setOpen(false)}>
          <View className="flex-row items-center justify-between">
            <Text variant="h3">Filtros</Text>
            <View className="flex-row gap-5">
              <Button
                title="Limpiar"
                variant="secondary"
                onPress={() => onChange({})}
              />
              <Button title="Cerrar" onPress={() => setOpen(false)} />
            </View>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <SearchSelect
              label="Autor"
              value={filters.author}
              onChange={(author) => set({ author, series: undefined })}
              fetchOptions={fetchAuthors}
            />
            <SearchSelect
              label="Editorial"
              value={filters.publisher}
              onChange={(publisher) =>
                set({ publisher, collectionId: undefined })
              }
              fetchOptions={fetchPublishers}
            />
            <SearchSelect
              label="Serie"
              value={filters.series}
              onChange={(series) => set({ series })}
              fetchOptions={fetchSeries}
            />
            {collections.length > 0 && (
              <SimpleSelect
                label="Colección"
                options={collections}
                value={filters.collectionId}
                onChange={(collectionId) => set({ collectionId })}
              />
            )}
            <SimpleSelect
              label="Categoría"
              options={categories}
              value={filters.categoryId}
              onChange={(categoryId) => set({ categoryId })}
            />
            <SimpleSelect
              label="Subcategoría"
              options={subcategories}
              value={filters.subcategoryId}
              onChange={(subcategoryId) => set({ subcategoryId })}
            />
          </ScrollView>
        </Dialog>
      )}
    </>
  );
}
