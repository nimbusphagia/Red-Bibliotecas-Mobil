import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import {
  direction,
  hasNoReferences,
  hasNoRows,
  hasRows,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import { author, book, series } from "@/db/schema";
import type { ReferenceUsage } from "../_shared/reference";
import type {
  NewSeries,
  Series,
  SeriesListFilters,
  SeriesListItem,
  SeriesPatch,
} from "./types";
import { Page } from "@/shared/types/types";

const books: Reference = { table: book, column: book.seriesId };
const bookCount = rowCount(books, series.id);

// Queries
export async function findSeriesById(id: number): Promise<Series | null> {
  const [row] = await db.select().from(series).where(eq(series.id, id));
  return row ?? null;
}

export async function listSeries(
  filters: SeriesListFilters,
): Promise<Page<SeriesListItem>> {
  const { tokens, authorId, withBooks, sortBy, sortDir, limit, offset } =
    filters;

  const byAuthor =
    authorId === undefined ? undefined : eq(series.authorId, authorId);

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? hasRows(books, series.id)
        : hasNoRows(books, series.id);

  const where = and(
    ...likeTokens(series.nameKey, tokens),
    byAuthor,
    bookPresence,
  );

  const sortKey = {
    name: series.nameKey,
    createdAt: series.createdAt,
    bookCount,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        ...getTableColumns(series),
        authorFirstName: author.firstName,
        authorLastName: author.lastName,
        bookCount,
      })
      .from(series)
      .innerJoin(author, eq(series.authorId, author.id))
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(series.nameKey), asc(series.id))
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(series).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countSeriesUsage(
  id: number,
): Promise<ReferenceUsage | null> {
  const [row] = await db
    .select({ books: bookCount })
    .from(series)
    .where(eq(series.id, id));
  return row ?? null;
}

// Actions
export async function insertSeries(values: NewSeries): Promise<Series> {
  const [row] = await db.insert(series).values(values).returning();
  return row;
}

export async function updateSeries(
  id: number,
  patch: SeriesPatch,
): Promise<Series | null> {
  const [row] = await db
    .update(series)
    .set(patch)
    .where(eq(series.id, id))
    .returning();
  return row ?? null;
}

export async function deleteSeriesIfUnused(id: number): Promise<boolean> {
  const deleted = await db
    .delete(series)
    .where(and(eq(series.id, id), hasNoReferences(series.id, books)))
    .returning({ id: series.id });
  return deleted.length > 0;
}
