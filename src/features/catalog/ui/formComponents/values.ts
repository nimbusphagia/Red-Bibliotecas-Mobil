import type { BookInput } from "@/features/catalog/internal/book/schemas";
import type { Option } from "@/features/shared/components/select/Select";

export const ROLES = [
  { key: "writers", role: "writer", label: "Escritores" },
  { key: "illustrators", role: "illustrator", label: "Ilustradores" },
  { key: "translators", role: "translator", label: "Traductores" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];

export type BookFormValues = Record<RoleKey, Option[]> & {
  title: string;
  publisher?: Option;
  collection?: Option;
  series?: Option;
  categoryId?: number;
  subcategoryId?: number;
  year: string;
  pages: string;
  quantity: string;
  shelfId?: number;
  omitWords: string;
};

export const EMPTY_VALUES: BookFormValues = {
  title: "",
  writers: [],
  illustrators: [],
  translators: [],
  year: "",
  pages: "",
  quantity: "1",
  omitWords: "",
};

const toInt = (s: string) => (s === "" ? null : Number(s));

export const toBookInput = (v: BookFormValues): BookInput => ({
  title: v.title,
  collaborators: ROLES.flatMap(({ key, role }) =>
    v[key].map((o) => ({ authorId: o.id, role })),
  ),
  publisherId: v.publisher?.id ?? null,
  collectionId: v.collection?.id ?? null,
  seriesId: v.series?.id ?? null,
  categoryId: v.categoryId ?? null,
  subcategoryId: v.subcategoryId ?? null,
  publicationYear: toInt(v.year),
  pageCount: toInt(v.pages),
});
