import { listCategories } from "@/features/catalog/internal/category/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import { shelfLabel } from "@/features/shared/format/translate";
import { requireStockRole } from "../movement/utils/auth";
import { listShelves } from "../shelf/service";
import { IMPORT_COLUMNS, IMPORT_HEADERS } from "./columns";
import { resolveRows } from "./resolve";
import { parseSheet } from "./sheet";
import type { ImportPlan } from "./types";
export { createImportEntities, type CreatedRefs } from "./create";

type Coded = { code: string; name: string };

export type TemplateData = {
  headers: string[];
  /** Para cada columna: si es de códigos (se guarda como texto). */
  text: boolean[];
  /** Para cada columna: si es obligatoria. */
  required: boolean[];
  example: string[];
  /** Valores válidos para las columnas de categoría, subcategoría y estante. */
  categories: Coded[];
  subcategories: Coded[];
  shelves: string[];
};

/** Datos para armar la plantilla; el ejemplo usa códigos que sí existen. */
export async function entryTemplate(): Promise<TemplateData> {
  const [categories, subcategories, shelves] = await Promise.all([
    listCategories({ limit: 100 }),
    listSubcategories({ limit: 100 }),
    listShelves({ limit: 100 }),
  ]);
  const code = (items: Coded[]) => items[0]?.code ?? "";
  return {
    headers: [...IMPORT_HEADERS],
    required: IMPORT_COLUMNS.map((c) => "required" in c),
    text: IMPORT_COLUMNS.map(
      (c) => c.key === "category" || c.key === "subcategory",
    ),
    example: IMPORT_COLUMNS.map((c) =>
      c.key === "category"
        ? code(categories)
        : c.key === "subcategory"
          ? code(subcategories)
          : c.example,
    ),
    categories: categories.map(({ code, name }) => ({ code, name })),
    subcategories: subcategories.map(({ code, name }) => ({ code, name })),
    shelves: shelves.items.map(shelfLabel),
  };
}

/** Lee la tabla del archivo y la compara con el catálogo, sin guardar nada. */
export async function resolveEntryImport(
  actorId: number,
  grid: string[][],
): Promise<ImportPlan> {
  await requireStockRole(actorId, "import stock");
  const sheet = parseSheet(grid);
  const { rows: _rows, ...rest } = sheet;
  if (sheet.problem) {
    return {
      ...rest,
      rows: [],
      toCreate: { authors: [], publishers: [], collections: [], series: [] },
    };
  }
  return { ...rest, ...(await resolveRows(sheet.rows)) };
}
