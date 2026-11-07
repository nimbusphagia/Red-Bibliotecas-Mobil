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
import { book, collection, publisher } from "@/db/schema";
import type {
  NewPublisher,
  Publisher,
  PublisherListFilters,
  PublisherUsage,
  PublisherWithBookCount,
} from "./types";
import { Page } from "@/shared/types/types";

// References
const books: Reference = { table: book, column: book.publisherId };
const collections: Reference = {
  table: collection,
  column: collection.publisherId,
};

const bookCount = rowCount(books, publisher.id);
const collectionCount = rowCount(collections, publisher.id);

// Queries
export async function findPublisherById(id: number): Promise<Publisher | null> {
  const [row] = await db.select().from(publisher).where(eq(publisher.id, id));
  return row ?? null;
}

export async function listPublishers(
  filters: PublisherListFilters,
): Promise<Page<PublisherWithBookCount>> {
  const { tokens, withBooks, sortBy, sortDir, limit, offset } = filters;

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? hasRows(books, publisher.id)
        : hasNoRows(books, publisher.id);

  const where = and(...likeTokens(publisher.nameKey, tokens), bookPresence);

  const sortKey = {
    name: publisher.nameKey,
    createdAt: publisher.createdAt,
    bookCount,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({ ...getTableColumns(publisher), bookCount })
      .from(publisher)
      .where(where)
      .orderBy(
        direction(sortDir)(sortKey),
        asc(publisher.nameKey),
        asc(publisher.id),
      )
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(publisher).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countPublisherUsage(
  id: number,
): Promise<PublisherUsage | null> {
  const [row] = await db
    .select({ books: bookCount, collections: collectionCount })
    .from(publisher)
    .where(eq(publisher.id, id));
  return row ?? null;
}

// Actions
export async function insertPublisher(
  values: NewPublisher,
): Promise<Publisher> {
  const [row] = await db.insert(publisher).values(values).returning();
  return row;
}

export async function updatePublisher(
  id: number,
  patch: Partial<NewPublisher>,
): Promise<Publisher | null> {
  const [row] = await db
    .update(publisher)
    .set(patch)
    .where(eq(publisher.id, id))
    .returning();
  return row ?? null;
}

export async function deletePublisherIfUnused(id: number): Promise<boolean> {
  const deleted = await db
    .delete(publisher)
    .where(
      and(
        eq(publisher.id, id),
        hasNoReferences(publisher.id, books, collections),
      ),
    )
    .returning({ id: publisher.id });
  return deleted.length > 0;
}
