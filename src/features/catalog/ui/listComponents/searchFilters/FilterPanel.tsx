import { listAuthors } from "@/features/catalog/internal/author/service";
import { listCategories } from "@/features/catalog/internal/category/service";
import { listCollections } from "@/features/catalog/internal/collection/service";
import { listPublishers } from "@/features/catalog/internal/publisher/service";
import { listSeries } from "@/features/catalog/internal/series/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import { Button, Text } from "@/features/shared/components";
import {
  SearchSelect,
  SimpleSelect,
  type Option,
} from "@/features/shared/components/select/Select";
import { colors } from "@/features/shared/theme";
import { Circle, SlidersHorizontal } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

export type CatalogFilters = {
  author?: Option;
  publisher?: Option;
  series?: Option;
  categoryId?: number;
  subcategoryId?: number;
  collectionId?: number;
};

const LIMIT = 20;

const fetchAuthors = async (search: string): Promise<Option[]> =>
  (await listAuthors({ search, withBooks: true, limit: LIMIT })).items.map(
    (a) => ({
      id: a.id,
      label: [a.firstName, a.lastName].filter(Boolean).join(" "),
    }),
  );

const fetchPublishers = async (search: string): Promise<Option[]> =>
  (await listPublishers({ search, withBooks: true, limit: LIMIT })).items.map(
    (p) => ({ id: p.id, label: p.name }),
  );

const loadCategories = async (): Promise<Option[]> =>
  (await listCategories({ limit: 100 })).map((c) => ({
    id: c.id,
    label: c.name,
  }));

const loadSubcategories = async (): Promise<Option[]> =>
  (await listSubcategories({ limit: 100 })).map((s) => ({
    id: s.id,
    label: s.name,
  }));

function useOptions(load: (() => Promise<Option[]>) | null) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!load) {
      setOptions([]);
      return;
    }
    let stale = false;
    load().then((o) => {
      if (!stale) setOptions(o);
    });
    return () => {
      stale = true;
    };
  }, [load]);
  return options;
}

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
    async (): Promise<Option[]> =>
      (
        await listCollections({ publisherId, withBooks: true, limit: 100 })
      ).items.map((c) => ({ id: c.id, label: c.name })),
    [publisherId],
  );

  const categories = useOptions(loadCategories);
  const subcategories = useOptions(loadSubcategories);
  const collections = useOptions(publisherId ? loadCollections : null);

  return (
    <>
      <View>
        <Button
          variant="pill-secondary"
          lucideIcon={<SlidersHorizontal size={18} color={colors.primary} />}
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
      <Modal
        transparent
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 items-center justify-center ">
          <Pressable
            style={StyleSheet.absoluteFill}
            className="bg-black/5"
            onPress={() => setOpen(false)}
          />
          <View className="max-h-[80%] w-[480px] max-w-full gap-4 rounded-2xl bg-bg p-7 pt-6 border border-fg1">
            <View className="flex-row items-center justify-between">
              <Text variant="h3">Filtros</Text>
              <View className="flex-row gap-5">
                <Button
                  title="Limpiar"
                  variant="pill-secondary"
                  onPress={() => onChange({})}
                />
                <Button
                  title="Cerrar"
                  variant="pill"
                  onPress={() => setOpen(false)}
                />
              </View>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 20 }}
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
          </View>
        </View>
      </Modal>
    </>
  );
}
