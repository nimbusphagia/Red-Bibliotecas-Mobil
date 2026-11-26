import type { BookListItem } from "@/features/catalog/internal/book/types";
import { listAuthors } from "@/features/catalog/internal/author/service";
import { listCategories } from "@/features/catalog/internal/category/service";
import { listCollections } from "@/features/catalog/internal/collection/service";
import { listPublishers } from "@/features/catalog/internal/publisher/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import { listShelves } from "@/features/inventory/internal/shelf/service";
import type { Option } from "@/features/shared/components";
import { useEffect, useState } from "react";
import { listSeries } from "../internal/series/service";
import { shelfLabel } from "@/features/shared/format/translate";

type WithBooks = true | undefined;

const LIMIT = 20;

export const fullName = (p: { firstName: string; lastName: string | null }) =>
  [p.firstName, p.lastName].filter(Boolean).join(" ");

/** Escritores del libro, sin repetir, separados por coma. */
export const writersOf = (book: BookListItem) =>
  [
    ...new Set(
      book.collaborators.filter((c) => c.role === "writer").map(fullName),
    ),
  ].join(", ");

export const searchAuthors = async (
  search: string,
  withBooks?: WithBooks,
): Promise<Option[]> =>
  (await listAuthors({ search, withBooks, limit: LIMIT })).items.map((a) => ({
    id: a.id,
    label: fullName(a),
  }));

export const searchPublishers = async (
  search: string,
  withBooks?: WithBooks,
): Promise<Option[]> =>
  (await listPublishers({ search, withBooks, limit: LIMIT })).items.map(
    (p) => ({ id: p.id, label: p.name }),
  );

export const fetchCollections = async (
  publisherId: number | undefined,
  withBooks?: WithBooks,
): Promise<Option[]> =>
  (await listCollections({ publisherId, withBooks, limit: 100 })).items.map(
    (c) => ({ id: c.id, label: c.name }),
  );

export const loadCategories = async (): Promise<Option[]> =>
  (await listCategories({ limit: 100 })).map((c) => ({
    id: c.id,
    label: c.name,
  }));

export const loadSubcategories = async (): Promise<Option[]> =>
  (await listSubcategories({ limit: 100 })).map((s) => ({
    id: s.id,
    label: s.name,
  }));

export const searchCollections = async (
  search: string,
  publisherId?: number,
): Promise<Option[]> =>
  (await listCollections({ search, publisherId, limit: LIMIT })).items.map(
    (c) => ({ id: c.id, label: c.name }),
  );

/** Series de los autores dados (escritores o ilustradores del libro). */
export const searchSeries = async (
  search: string,
  authorIds: number[],
): Promise<Option[]> => {
  const pages = await Promise.all(
    authorIds.map((authorId) => listSeries({ search, authorId, limit: LIMIT })),
  );
  return pages
    .flatMap((p) => p.items)
    .map((s) => ({
      id: s.id,
      label: `${s.name} · ${fullName({ firstName: s.authorFirstName, lastName: s.authorLastName })}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, LIMIT);
};

export const loadShelves = async (): Promise<Option[]> => {
  const { items } = await listShelves({ limit: 100 });
  const ordered = [
    ...items.filter((s) => s.isDefault),
    ...items.filter((s) => !s.isDefault),
  ];
  return ordered.map((s) => ({ id: s.id, label: shelfLabel(s) }));
};

export function useOptions(load: (() => Promise<Option[]>) | null) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!load) {
      setOptions([]);
      return;
    }
    let stale = false;
    void load().then((o) => {
      if (!stale) setOptions(o);
    });
    return () => {
      stale = true;
    };
  }, [load]);
  return options;
}
