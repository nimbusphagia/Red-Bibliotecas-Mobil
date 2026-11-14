import type { BookInput } from "@/features/catalog/internal/book/schemas";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { Option } from "@/features/shared/components";
import { fullName } from "../options";

export const ROLES = [
  { key: "writers", role: "writer" },
  { key: "illustrators", role: "illustrator" },
  { key: "translators", role: "translator" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];

export type BookFormValues = Record<RoleKey, Option[]> & {
  title: string;
  publisher?: Option;
  collection?: Option;
  series?: Option;
  category?: Option;
  subcategory?: Option;
  year: string;
  pages: string;
  quantity: string;
  shelf?: Option;
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
  categoryId: v.category?.id ?? null,
  subcategoryId: v.subcategory?.id ?? null,
  publicationYear: toInt(v.year),
  pageCount: toInt(v.pages),
});

const ref = (id: number | null, label: string | null): Option | undefined =>
  id === null || label === null ? undefined : { id, label };

export const fromBook = (b: BookListItem): BookFormValues => {
  const people = (role: string): Option[] =>
    b.collaborators
      .filter((c) => c.role === role)
      .map((c) => ({ id: c.authorId, label: fullName(c) }));

  return {
    ...EMPTY_VALUES,
    title: b.title,
    writers: people("writer"),
    illustrators: people("illustrator"),
    translators: people("translator"),
    publisher: ref(b.publisherId, b.publisherName),
    collection: ref(b.collectionId, b.collectionName),
    series: ref(b.seriesId, b.seriesName),
    category: ref(b.categoryId, b.categoryName),
    subcategory: ref(b.subcategoryId, b.subcategoryName),
    year: b.publicationYear?.toString() ?? "",
    pages: b.pageCount?.toString() ?? "",
  };
};
