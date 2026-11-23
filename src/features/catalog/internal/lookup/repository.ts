import { db } from "@/db/client";
import {
  author,
  book,
  bookCollaborator,
  collection,
  publisher,
  series,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function findAuthorsByKey(keys: string[]) {
  if (keys.length === 0) return [];
  return db.select().from(author).where(inArray(author.nameKey, keys));
}

export async function findPublishersByKey(keys: string[]) {
  if (keys.length === 0) return [];
  return db.select().from(publisher).where(inArray(publisher.nameKey, keys));
}

export async function findCollectionsByKey(
  publisherIds: number[],
  keys: string[],
) {
  if (publisherIds.length === 0 || keys.length === 0) return [];
  return db
    .select()
    .from(collection)
    .where(
      and(
        inArray(collection.publisherId, publisherIds),
        inArray(collection.nameKey, keys),
      ),
    );
}

export async function findSeriesByKey(authorIds: number[], keys: string[]) {
  if (authorIds.length === 0 || keys.length === 0) return [];
  return db
    .select()
    .from(series)
    .where(
      and(inArray(series.authorId, authorIds), inArray(series.nameKey, keys)),
    );
}

/** Libros con alguno de esos títulos (ya normalizados), con sus escritores. */
export async function findBooksByTitleKey(keys: string[]) {
  if (keys.length === 0) return [];
  const books = await db
    .select({ id: book.id, title: book.title, titleKey: book.titleKey })
    .from(book)
    .where(inArray(book.titleKey, keys));
  if (books.length === 0) return [];

  const writers = await db
    .select({
      bookId: bookCollaborator.bookId,
      authorId: bookCollaborator.collaboratorId,
    })
    .from(bookCollaborator)
    .where(
      and(
        inArray(
          bookCollaborator.bookId,
          books.map((b) => b.id),
        ),
        eq(bookCollaborator.role, "writer"),
      ),
    );

  return books.map((b) => ({
    ...b,
    writerIds: writers.filter((w) => w.bookId === b.id).map((w) => w.authorId),
  }));
}
