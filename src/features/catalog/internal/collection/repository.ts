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
import { Page } from "@/features/shared/types/types";
import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import type { ReferenceUsage } from "../_shared/reference";
import type {
  Collection,
  CollectionListFilters,
  CollectionListItem,
  CollectionPatch,
  NewCollection,
} from "./types";

const books: Reference = { table: book, column: book.collectionId };
const bookCount = rowCount(books, collection.id);

// Queries
export async function findCollectionById(
  id: number,
): Promise<Collection | null> {
  const [row] = await db.select().from(collection).where(eq(collection.id, id));
  return row ?? null;
}

export async function listCollections(
  filters: CollectionListFilters,
): Promise<Page<CollectionListItem>> {
  const { tokens, publisherId, withBooks, sortBy, sortDir, limit, offset } =
    filters;

  const byPublisher =
    publisherId === undefined
      ? undefined
      : eq(collection.publisherId, publisherId);

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? hasRows(books, collection.id)
        : hasNoRows(books, collection.id);

  const where = and(
    ...likeTokens(collection.nameKey, tokens),
    byPublisher,
    bookPresence,
  );

  const sortKey = {
    name: collection.nameKey,
    createdAt: collection.createdAt,
    bookCount,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        ...getTableColumns(collection),
        publisherName: publisher.name,
        bookCount,
      })
      .from(collection)
      .innerJoin(publisher, eq(collection.publisherId, publisher.id))
      .where(where)
      .orderBy(
        direction(sortDir)(sortKey),
        asc(collection.nameKey),
        asc(collection.id),
      )
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(collection).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countCollectionUsage(
  id: number,
): Promise<ReferenceUsage | null> {
  const [row] = await db
    .select({ books: bookCount })
    .from(collection)
    .where(eq(collection.id, id));
  return row ?? null;
}

// Actions
export async function insertCollection(
  values: NewCollection,
): Promise<Collection> {
  const [row] = await db.insert(collection).values(values).returning();
  return row;
}

export async function updateCollection(
  id: number,
  patch: CollectionPatch,
): Promise<Collection | null> {
  const [row] = await db
    .update(collection)
    .set(patch)
    .where(eq(collection.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCollectionIfUnused(id: number): Promise<boolean> {
  const deleted = await db
    .delete(collection)
    .where(and(eq(collection.id, id), hasNoReferences(collection.id, books)))
    .returning({ id: collection.id });
  return deleted.length > 0;
}
