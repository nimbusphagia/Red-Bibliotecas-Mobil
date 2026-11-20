import { listSeries } from "@/features/catalog/internal/series/service";
import {
  Button,
  Dialog,
  DialogBody,
  DialogHeader,
  SearchSelect,
  SimpleSelect,
  type Option,
} from "@/features/shared/components";
import { useCallback } from "react";
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

export const toBookParams = (f: CatalogFilters) => ({
  authorId: f.author?.id,
  publisherId: f.publisher?.id,
  seriesId: f.series?.id,
  categoryId: f.categoryId,
  subcategoryId: f.subcategoryId,
  collectionId: f.collectionId,
});

export type FilterField = "author" | "publisher" | "category" | "subcategory";
export type FilterDialog = FilterField | "all" | null;

const LIMIT = 20;

const fetchAuthors = (s: string) => searchAuthors(s, true);
const fetchPublishers = (s: string) => searchPublishers(s, true);

type Props = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  open: FilterDialog;
  onOpenChange: (open: FilterDialog) => void;
};

export default function FilterPanel({
  filters,
  onChange,
  open,
  onOpenChange: setOpen,
}: Props) {
  const all = open === "all";
  const shows = (field: FilterField) => all || open === field;
  const set = (patch: Partial<CatalogFilters>) => {
    onChange({ ...filters, ...patch });
    if (!all) setOpen(null);
  };
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
      {open && (
        <Dialog onClose={() => setOpen(null)}>
          {all && (
            <DialogHeader
              title="Filtros"
              actions={
                <>
                  <Button
                    title="Limpiar"
                    variant="ghost"
                    onPress={() => onChange({})}
                  />
                  <Button title="Cerrar" onPress={() => setOpen(null)} />
                </>
              }
            />
          )}
          <DialogBody>
            {shows("author") && (
              <SearchSelect
                label="Autor"
                value={filters.author}
                onChange={(author) => set({ author, series: undefined })}
                fetchOptions={fetchAuthors}
                initiallyOpen={!all}
              />
            )}
            {shows("publisher") && (
              <SearchSelect
                label="Editorial"
                value={filters.publisher}
                onChange={(publisher) =>
                  set({ publisher, collectionId: undefined })
                }
                fetchOptions={fetchPublishers}
                initiallyOpen={!all}
              />
            )}
            {all && filters.author && (
              <SearchSelect
                label="Serie"
                value={filters.series}
                onChange={(series) => set({ series })}
                fetchOptions={fetchSeries}
              />
            )}
            {all && collections.length > 0 && (
              <SimpleSelect
                label="Colección"
                options={collections}
                value={filters.collectionId}
                onChange={(collectionId) => set({ collectionId })}
              />
            )}
            {shows("category") && (
              <SimpleSelect
                label="Categoría"
                options={categories}
                value={filters.categoryId}
                onChange={(categoryId) => set({ categoryId })}
              />
            )}
            {shows("subcategory") && (
              <SimpleSelect
                label="Subcategoría"
                options={subcategories}
                value={filters.subcategoryId}
                onChange={(subcategoryId) => set({ subcategoryId })}
              />
            )}
          </DialogBody>
        </Dialog>
      )}
    </>
  );
}
