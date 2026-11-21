import type { Option } from "@/features/shared/components";
import type { Tone } from "@/features/shared/theme";
import {
  loadCategories,
  loadShelves,
  loadSubcategories,
  searchPublishers,
  searchSeries,
} from "../../options";
import type { BookFormValues } from "./values";

export type Field = {
  key: keyof BookFormValues;
  label: string;
  kind: "text" | "number" | "pick" | "search" | "multi";
  required?: true | "create";
  lockable?: boolean;
  inline?: boolean;
  error?: string;
  createOnly?: true;
  min?: number;
  max?: number;
  load?: () => Promise<Option[]>;
  fetch?: (search: string) => Promise<Option[]>;
};

export type Group = {
  title: string;
  /** "dark" para una sección de fondo dark1; el contenido se adapta solo. */
  tone?: Tone;
  createOnly?: boolean;
  fields: Field[];
  compact?: boolean;
};

export const COLUMNS: Group[][] = [
  [
    {
      title: "Detalles",
      fields: [
        {
          key: "title",
          label: "Título",
          kind: "text",
          required: true,
          lockable: true,
        },
        {
          key: "writers",
          label: "Escritor",
          kind: "multi",
          required: true,
          lockable: true,
          error: "collaborators",
        },
        { key: "illustrators", label: "Ilustrador", kind: "multi" },
        { key: "translators", label: "Traductor", kind: "multi" },
        { key: "year", label: "Año", kind: "number", error: "publicationYear" },
        { key: "pages", label: "Páginas", kind: "number", error: "pageCount" },
        {
          key: "publisher",
          label: "Editorial",
          kind: "search",
          error: "publisherId",
          fetch: searchPublishers,
        },
        {
          key: "collection",
          label: "Colección",
          kind: "search",
          error: "collectionId",
        },
        {
          key: "series",
          label: "Serie",
          kind: "search",
          error: "seriesId",
          fetch: searchSeries,
        },
      ],
    },
  ],
  [
    {
      title: "Clasificación",
      fields: [
        {
          key: "category",
          label: "Categoría",
          kind: "pick",
          required: "create",
          lockable: true,
          inline: true,
          error: "categoryId",
          load: loadCategories,
        },
        {
          key: "subcategory",
          label: "Subcategoría",
          kind: "pick",
          required: "create",
          lockable: true,
          inline: true,
          error: "subcategoryId",
          load: loadSubcategories,
        },
        {
          key: "shelf",
          required: true,
          label: "Estante",
          kind: "pick",
          createOnly: true,
          inline: true,
          load: loadShelves,
        },
      ],
    },
    {
      title: "Ejemplares",
      createOnly: true,
      compact: true,
      fields: [
        {
          key: "quantity",
          label: "Cantidad",
          kind: "number",
          required: true,
          min: 1,
          max: 100,
        },
        { key: "omitWords", label: "Omitir", kind: "text" },
      ],
    },
  ],
];

export const display = (
  x: BookFormValues[keyof BookFormValues],
): string | null => {
  if (Array.isArray(x)) return x.map((o) => o.label).join(", ") || null;
  if (typeof x === "object") return x.label;
  return x || null;
};
