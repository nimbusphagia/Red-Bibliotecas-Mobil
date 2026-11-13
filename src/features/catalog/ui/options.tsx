import { listAuthors } from "@/features/catalog/internal/author/service";
import { listCategories } from "@/features/catalog/internal/category/service";
import { listCollections } from "@/features/catalog/internal/collection/service";
import { listPublishers } from "@/features/catalog/internal/publisher/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import type { Option } from "@/features/shared/components/select/Select";
import { useEffect, useState } from "react";
import { listSeries } from "../internal/series/service";

type WithBooks = true | undefined;

const LIMIT = 20;

export const fullName = (p: { firstName: string; lastName: string | null }) =>
  [p.firstName, p.lastName].filter(Boolean).join(" ");

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

export const searchSeries = async (search: string): Promise<Option[]> =>
  (await listSeries({ search, limit: LIMIT })).items.map((s) => ({
    id: s.id,
    label: `${s.name} · ${fullName({ firstName: s.authorFirstName, lastName: s.authorLastName })}`,
  }));

export function useOptions(load: (() => Promise<Option[]>) | null) {
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
