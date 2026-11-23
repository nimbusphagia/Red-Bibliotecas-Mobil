import { searchKey } from "@/features/shared/format/text";

/**
 * Columnas del archivo de entrada. `header` es el nombre que lleva la plantilla;
 * `aliases` son otros nombres que también se aceptan (ya normalizados).
 */
export const IMPORT_COLUMNS = [
  {
    key: "title",
    header: "Título",
    aliases: ["title"],
    required: true,
    example: "Cien años de soledad",
  },
  {
    key: "writers",
    header: "Escritor",
    aliases: ["escritores", "autor", "autores"],
    required: true,
    example: "García Márquez, Gabriel",
  },
  {
    key: "illustrators",
    header: "Ilustrador",
    aliases: ["ilustradores"],
    example: "",
  },
  {
    key: "translators",
    header: "Traductor",
    aliases: ["traductores"],
    example: "",
  },
  {
    key: "publisher",
    header: "Editorial",
    aliases: [],
    example: "Sudamericana",
  },
  { key: "collection", header: "Colección", aliases: [], example: "" },
  { key: "series", header: "Serie", aliases: [], example: "" },
  {
    key: "category",
    header: "Categoría",
    aliases: [],
    required: true,
    example: "800",
  },
  {
    key: "subcategory",
    header: "Subcategoría",
    aliases: [],
    required: true,
    example: "860",
  },
  {
    key: "year",
    header: "Año",
    aliases: ["anio", "year"],
    example: "1967",
  },
  { key: "pages", header: "Páginas", aliases: [], example: "471" },
  {
    key: "omitWords",
    header: "Omitir en tejuelo",
    aliases: ["omitir", "omitirpalabras"],
    example: "",
  },
  {
    key: "quantity",
    header: "Cantidad",
    aliases: ["ejemplares"],
    example: "2",
  },
  { key: "shelf", header: "Estante", aliases: ["estanteria"], example: "" },
] as const;

export type ImportColumn = (typeof IMPORT_COLUMNS)[number]["key"];

export const IMPORT_HEADERS = IMPORT_COLUMNS.map((c) => c.header);

export const headerOf = (key: ImportColumn): string =>
  IMPORT_COLUMNS.find((c) => c.key === key)!.header;

/** «Omitir en tejuelo», «omitir_en_tejuelo» y «OMITIR EN TEJUELO» son lo mismo. */
export const normalizeHeader = (text: string) =>
  searchKey(text).replace(/[^a-z0-9]/g, "");

const BY_HEADER = new Map<string, ImportColumn>(
  IMPORT_COLUMNS.flatMap((c) =>
    [c.header, ...c.aliases].map((h) => [normalizeHeader(h), c.key] as const),
  ),
);

export const columnOfHeader = (text: string): ImportColumn | undefined =>
  BY_HEADER.get(normalizeHeader(text));
