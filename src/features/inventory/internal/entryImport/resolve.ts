import {
  authorCode,
  titleCode,
} from "@/features/catalog/internal/_shared/codes";
import { NAME_MAX } from "@/features/catalog/internal/_shared/fields";
import { authorKey } from "@/features/catalog/internal/author/service";
import {
  MAX_OMIT_WORDS,
  OMIT_WORD_MAX,
} from "@/features/catalog/internal/book/schemas";
import { listCategories } from "@/features/catalog/internal/category/service";
import {
  findAuthorsByKey,
  findBooksByTitleKey,
  findCollectionsByKey,
  findLabelOwner,
  findPublishersByKey,
  findSeriesByKey,
} from "@/features/catalog/internal/lookup/service";
import { listSubcategories } from "@/features/catalog/internal/subcategory/service";
import { collapse, searchKey } from "@/features/shared/format/text";
import { shelfLabel } from "@/features/shared/format/translate";
import { MAX_COPIES_PER_BOOK } from "../movement/schemas";
import { listShelves } from "../shelf/service";
import type { ImportColumn } from "./columns";
import type { SheetRow } from "./sheet";
import type {
  ImportRowPlan,
  PersonRef,
  ProblemCode,
  Ref,
  RowProblem,
  ToCreate,
} from "./types";

type Person = { key: string; firstName: string; lastName: string | null };
type Coded = { id: number; code: string; nameKey: string };

const fullName = (p: Person) =>
  [p.firstName, p.lastName].filter(Boolean).join(" ");

/** «Apellido, Nombre»; sin coma es un solo nombre (Homero). Varios, con «;». */
function parsePeople(text: string): { people: Person[]; bad: string[] } {
  const people = new Map<string, Person>();
  const bad: string[] = [];
  for (const part of text.split(";").map(collapse).filter(Boolean)) {
    const comma = part.indexOf(",");
    const lastName = comma === -1 ? null : collapse(part.slice(0, comma));
    const firstName = collapse(comma === -1 ? part : part.slice(comma + 1));
    const incomplete = comma !== -1 && (!lastName || !firstName);
    const tooLong =
      firstName.length > NAME_MAX || (lastName?.length ?? 0) > NAME_MAX;
    if (incomplete || tooLong) {
      bad.push(part);
      continue;
    }
    const key = authorKey(firstName, lastName);
    people.set(key, { key, firstName, lastName });
  }
  return { people: [...people.values()], bad };
}

function matchCoded<T extends Coded>(items: T[], text: string): T | undefined {
  const code = text.toUpperCase();
  return (
    items.find((i) => i.code.toUpperCase() === code) ??
    items.find((i) => i.nameKey === searchKey(text))
  );
}

type Draft = {
  row: number;
  problems: RowProblem[];
  title: string;
  titleKey: string;
  omitWords: string[];
  people: { writers: Person[]; illustrators: Person[]; translators: Person[] };
  publisherName: string;
  collectionName: string;
  seriesName: string;
  categoryText: string;
  subcategoryText: string;
  year: number | null;
  pages: number | null;
  quantity: number;
  shelfText: string;
};

function draftOf({ row, cells }: SheetRow): Draft {
  const problems: RowProblem[] = [];
  const problem = (column: ImportColumn, code: ProblemCode, detail?: string) =>
    problems.push({ column, code, detail });
  const text = (c: ImportColumn) => cells[c] ?? "";

  const integer = (
    column: ImportColumn,
    min: number,
    max: number,
  ): number | null => {
    const raw = text(column);
    if (!raw) return null;
    if (!/^\d+$/.test(raw)) {
      problem(column, "bad_number", raw);
      return null;
    }
    const n = Number(raw);
    if (n < min || n > max) {
      problem(column, "out_of_range", raw);
      return null;
    }
    return n;
  };

  const title = text("title");
  if (!title) problem("title", "missing");
  else if (title.length > NAME_MAX) problem("title", "too_long");

  const omitWords = text("omitWords")
    .split(/[;,]/)
    .map(collapse)
    .filter(Boolean);
  if (omitWords.length > MAX_OMIT_WORDS) problem("omitWords", "too_many_words");
  else if (omitWords.some((w) => w.length > OMIT_WORD_MAX)) {
    problem("omitWords", "too_long");
  }

  const people = (column: "writers" | "illustrators" | "translators") => {
    const { people, bad } = parsePeople(text(column));
    for (const b of bad) problem(column, "bad_person", b);
    return people;
  };
  const writers = people("writers");
  if (writers.length === 0 && !problems.some((p) => p.column === "writers")) {
    problem("writers", "missing");
  }

  if (!text("category")) problem("category", "missing");
  if (!text("subcategory")) problem("subcategory", "missing");
  if (text("collection") && !text("publisher")) {
    problem("collection", "collection_without_publisher");
  }

  const year = integer("year", 0, 9999);
  const pages = integer("pages", 1, 100000);
  const quantity = integer("quantity", 1, MAX_COPIES_PER_BOOK) ?? 1;

  return {
    row,
    problems,
    title,
    titleKey: searchKey(title),
    omitWords,
    people: {
      writers,
      illustrators: people("illustrators"),
      translators: people("translators"),
    },
    publisherName: text("publisher"),
    collectionName: text("collection"),
    seriesName: text("series"),
    categoryText: text("category"),
    subcategoryText: text("subcategory"),
    year,
    pages,
    quantity,
    shelfText: text("shelf"),
  };
}

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

/**
 * Revisa cada fila contra el catálogo sin escribir nada: qué ya existe, qué
 * falta crear y qué filas no se pueden registrar (con el motivo).
 */
export async function resolveRows(
  rows: SheetRow[],
): Promise<{ rows: ImportRowPlan[]; toCreate: ToCreate }> {
  const drafts = rows.map(draftOf);

  const [categories, subcategories, shelves] = await Promise.all([
    listCategories({ limit: 100 }),
    listSubcategories({ limit: 100 }),
    listShelves({ limit: 100 }),
  ]);
  const defaultShelf = shelves.items.find((s) => s.isDefault);

  const allPeople = drafts.flatMap((d) => Object.values(d.people).flat());
  const authors = new Map(
    (await findAuthorsByKey([...new Set(allPeople.map((p) => p.key))])).map(
      (a) => [a.nameKey, a] as const,
    ),
  );

  const publisherKeys = [
    ...new Set(
      drafts
        .filter((d) => d.publisherName)
        .map((d) => searchKey(d.publisherName)),
    ),
  ];
  const publishers = new Map(
    (await findPublishersByKey(publisherKeys)).map(
      (p) => [p.nameKey, p] as const,
    ),
  );

  const collectionRows = drafts.filter(
    (d) => d.collectionName && d.publisherName,
  );
  const collections = new Map(
    (
      await findCollectionsByKey(
        [
          ...new Set(
            collectionRows.flatMap(
              (d) => publishers.get(searchKey(d.publisherName))?.id ?? [],
            ),
          ),
        ],
        [...new Set(collectionRows.map((d) => searchKey(d.collectionName)))],
      )
    ).map((c) => [`${c.publisherId}|${c.nameKey}`, c] as const),
  );

  const seriesRows = drafts.filter((d) => d.seriesName);
  const seriesAuthorIds = new Set<number>();
  for (const d of seriesRows) {
    for (const p of [...d.people.writers, ...d.people.illustrators]) {
      const id = authors.get(p.key)?.id;
      if (id !== undefined) seriesAuthorIds.add(id);
    }
  }
  const series = new Map(
    (
      await findSeriesByKey(
        [...seriesAuthorIds],
        [...new Set(seriesRows.map((d) => searchKey(d.seriesName)))],
      )
    ).map((s) => [`${s.authorId}|${s.nameKey}`, s] as const),
  );

  const booksByTitle = await findBooksByTitleKey([
    ...new Set(drafts.filter((d) => d.title).map((d) => d.titleKey)),
  ]);

  const personRef = (p: Person): PersonRef => ({
    key: p.key,
    name: fullName(p),
    firstName: p.firstName,
    lastName: p.lastName,
    id: authors.get(p.key)?.id ?? null,
  });

  const seenLabels = new Map<string, { row: number; sameBook: string }>();
  const plans: ImportRowPlan[] = [];

  for (const d of drafts) {
    const problems = [...d.problems];
    const problem = (
      column: ImportColumn,
      code: ProblemCode,
      detail?: string,
    ) => problems.push({ column, code, detail });

    const writers = d.people.writers.map(personRef);
    const illustrators = d.people.illustrators.map(personRef);
    const translators = d.people.translators.map(personRef);

    let publisher: ImportRowPlan["publisher"] = null;
    if (d.publisherName) {
      const key = searchKey(d.publisherName);
      const found = publishers.get(key);
      publisher = {
        key,
        name: found?.name ?? d.publisherName,
        id: found?.id ?? null,
      };
    }

    let collection: ImportRowPlan["collection"] = null;
    if (d.collectionName && publisher) {
      const key = searchKey(d.collectionName);
      const found =
        publisher.id === null
          ? undefined
          : collections.get(`${publisher.id}|${key}`);
      collection = {
        key: `${publisher.key}|${key}`,
        name: found?.name ?? d.collectionName,
        id: found?.id ?? null,
        publisherKey: publisher.key,
      };
    }

    let seriesRef: ImportRowPlan["series"] = null;
    if (d.seriesName && writers.length > 0) {
      const key = searchKey(d.seriesName);
      const hit = [...writers, ...illustrators]
        .map((p) => (p.id === null ? undefined : series.get(`${p.id}|${key}`)))
        .find(Boolean);
      const owner = hit
        ? [...writers, ...illustrators].find((p) => p.id === hit.authorId)!
        : writers[0];
      seriesRef = {
        key: `${owner.key}|${key}`,
        name: hit?.name ?? d.seriesName,
        id: hit?.id ?? null,
        authorKey: owner.key,
      };
    }

    const category = d.categoryText
      ? matchCoded(categories, d.categoryText)
      : undefined;
    if (d.categoryText && !category)
      problem("category", "unknown_category", d.categoryText);
    const subcategory = d.subcategoryText
      ? matchCoded(subcategories, d.subcategoryText)
      : undefined;
    if (d.subcategoryText && !subcategory) {
      problem("subcategory", "unknown_subcategory", d.subcategoryText);
    }

    let shelfId = defaultShelf?.id ?? null;
    if (d.shelfText) {
      const key = searchKey(d.shelfText);
      const found = shelves.items.find(
        (s) => s.nameKey === key || searchKey(shelfLabel(s)) === key,
      );
      if (found) shelfId = found.id;
      else problem("shelf", "unknown_shelf", d.shelfText);
    }

    // Revisiones que dependen de las anteriores: si la fila ya falla, no tiene
    // sentido comprobar si su tejuelo choca.
    if (problems.length === 0 && category && subcategory) {
      const writerIds = writers.flatMap((w) => w.id ?? []);
      const existing =
        writerIds.length === writers.length
          ? booksByTitle.find(
              (b) =>
                b.titleKey === d.titleKey && sameSet(b.writerIds, writerIds),
            )
          : undefined;

      const first = [...writers].sort((a, b) =>
        a.key < b.key ? -1 : a.key > b.key ? 1 : 0,
      )[0];
      const writerCode =
        first.id !== null
          ? authors.get(first.key)!.code
          : authorCode(first.firstName, first.lastName);
      const tCode = titleCode(d.title, d.omitWords);

      if (existing) problem("title", "book_exists", existing.title);
      else if (!writerCode) problem("writers", "writer_unusable", first.name);
      else if (!tCode) problem("title", "title_unusable");
      else {
        const prefix = `${category.code}-${writerCode}-${subcategory.code}-${tCode}`;
        const owner = findLabelOwner(prefix, tCode);
        const earlier = seenLabels.get(prefix);
        const bookId = `${d.titleKey}|${[...writers]
          .map((w) => w.key)
          .sort()
          .join(";")}`;
        if (owner) problem("omitWords", "label_conflict", owner.title);
        else if (earlier) {
          if (earlier.sameBook === bookId) {
            problem("title", "duplicate_in_file", String(earlier.row));
          } else {
            problem("omitWords", "label_conflict_in_file", String(earlier.row));
          }
        } else seenLabels.set(prefix, { row: d.row, sameBook: bookId });
      }
    }

    plans.push({
      row: d.row,
      title: d.title,
      writers,
      illustrators,
      translators,
      publisher,
      collection,
      series: seriesRef,
      categoryId: category?.id ?? null,
      subcategoryId: subcategory?.id ?? null,
      year: d.year,
      pages: d.pages,
      omitWords: d.omitWords,
      quantity: d.quantity,
      shelfId,
      problems,
    });
  }

  return { rows: plans, toCreate: toCreate(plans) };
}

function toCreate(plans: ImportRowPlan[]): ToCreate {
  const out = {
    authors: new Map<string, PersonRef>(),
    publishers: new Map<string, Ref>(),
    collections: new Map<string, ToCreate["collections"][number]>(),
    series: new Map<string, ToCreate["series"][number]>(),
  };
  for (const r of plans) {
    if (r.problems.length > 0) continue;
    for (const p of [...r.writers, ...r.illustrators, ...r.translators]) {
      if (p.id === null) out.authors.set(p.key, p);
    }
    if (r.publisher?.id === null)
      out.publishers.set(r.publisher.key, r.publisher);
    if (r.collection?.id === null)
      out.collections.set(r.collection.key, r.collection);
    if (r.series?.id === null) out.series.set(r.series.key, r.series);
  }
  return {
    authors: [...out.authors.values()],
    publishers: [...out.publishers.values()],
    collections: [...out.collections.values()],
    series: [...out.series.values()],
  };
}
