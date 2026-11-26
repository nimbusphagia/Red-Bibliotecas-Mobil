import type { BookFormValues } from "@/features/catalog/ui/form/fields/values";
import type { CreatedRefs } from "@/features/inventory/internal/entryImport/create";
import type {
  ImportRowPlan,
  PersonRef,
} from "@/features/inventory/internal/entryImport/types";
import type { Option } from "@/features/shared/components";
import { ValidationError } from "@/features/shared/errors/errors";

/** Nombres de lo que ya existe, para mostrar en los campos del formulario. */
export type CatalogOptions = {
  categories: Option[];
  subcategories: Option[];
  shelves: Option[];
};

export const isReady = (row: ImportRowPlan) => row.problems.length === 0;

const idOf = (
  id: number | null,
  created: Record<string, number>,
  key: string,
) => {
  const found = id ?? created[key];
  if (found === undefined) throw new ValidationError([{ path: key, message: `Falta crear «${key}»` }]);
  return found;
};

/** Los valores del formulario de libro para una fila ya revisada y sin problemas. */
export function toFormValues(
  row: ImportRowPlan,
  created: CreatedRefs,
  catalog: CatalogOptions,
): BookFormValues {
  const person = (p: PersonRef): Option => ({
    id: idOf(p.id, created.authors, p.key),
    label: p.name,
  });
  const pick = (options: Option[], id: number | null) =>
    options.find((o) => o.id === id);

  const authorName = (key: string) =>
    [...row.writers, ...row.illustrators].find((p) => p.key === key)?.name ??
    "";

  return {
    title: row.title,
    writers: row.writers.map(person),
    illustrators: row.illustrators.map(person),
    translators: row.translators.map(person),
    publisher: row.publisher
      ? {
          id: idOf(row.publisher.id, created.publishers, row.publisher.key),
          label: row.publisher.name,
        }
      : undefined,
    collection: row.collection
      ? {
          id: idOf(row.collection.id, created.collections, row.collection.key),
          label: row.collection.name,
        }
      : undefined,
    series: row.series
      ? {
          id: idOf(row.series.id, created.series, row.series.key),
          label: `${row.series.name} · ${authorName(row.series.authorKey)}`,
        }
      : undefined,
    category: pick(catalog.categories, row.categoryId),
    subcategory: pick(catalog.subcategories, row.subcategoryId),
    year: row.year?.toString() ?? "",
    pages: row.pages?.toString() ?? "",
    quantity: String(row.quantity),
    shelf: pick(catalog.shelves, row.shelfId),
    omitWords: row.omitWords.join(", "),
  };
}
