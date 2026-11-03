import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  exists,
  getTableColumns,
  notExists,
  sql,
} from "drizzle-orm";
import { db } from "@/db/client";
import { publisher, collection, book } from "@/db/schema";
import type {
  Publisher,
  PublisherListFilters,
  PublisherUsage,
  PublisherWithBookCount,
  NewPublisher,
} from "./types";

// SQL fragments
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const publishedBooks = () =>
  db
    .select({ one: sql`1` })
    .from(book)
    .where(eq(book.publisherId, publisher.id));

const publishedCollections = () =>
  db
    .select({ one: sql`1` })
    .from(collection)
    .where(eq(collection.publisherId, publisher.id));

const bookCount = sql<number>`(${db
  .select({ n: countDistinct(book.id) })
  .from(book)
  .where(eq(book.publisherId, publisher.id))})`.mapWith(Number);

const collectionsCount = sql<number>`(${db
  .select({ n: count() })
  .from(collection)
  .where(eq(collection.publisherId, publisher.id))})`.mapWith(Number);

const hasNoReferences = () =>
  and(notExists(publishedBooks()), notExists(publishedCollections()));

export async function findPublisherById(id: number): Promise<Publisher | null> {
  const [row] = await db.select().from(publisher).where(eq(publisher.id, id));
  return row ?? null;
}

// Queries
export async function listPublishers(
  filters: PublisherListFilters,
): Promise<PublisherWithBookCount[]> {
  const { tokens, withBooks, sortBy, sortDir, limit, offset } = filters;

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? exists(publishedBooks())
        : notExists(publishedBooks());

  const sortKey = {
    name: sql`lower(${publisher.name})`,
    createdAt: publisher.createdAt,
    bookCount,
  }[sortBy];
  const direction = sortDir === "desc" ? desc : asc;

  return db
    .select({ ...getTableColumns(publisher), bookCount })
    .from(publisher)
    .where(
      and(
        ...tokens.map(
          (t) =>
            sql`${publisher.name} like ${`%${escapeLike(t)}%`} escape '\\'`,
        ),
        bookPresence,
      ),
    )
    .orderBy(direction(sortKey), asc(publisher.name), asc(publisher.id))
    .limit(limit)
    .offset(offset);
}

export async function countPublisherUsage(
  id: number,
): Promise<PublisherUsage | null> {
  const [row] = await db
    .select({ books: bookCount, collections: collectionsCount })
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
    .where(and(eq(publisher.id, id), hasNoReferences()))
    .returning({ id: publisher.id });
  return deleted.length > 0;
}
