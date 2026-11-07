import {
  and,
  asc,
  eq,
  exists,
  getTableColumns,
  inArray,
  notInArray,
  or,
  sql,
  count,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db/client";
import type { Executor } from "@/db/transaction";
import {
  direction,
  hasRows,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import {
  author,
  book,
  bookCollaborator,
  category,
  collection,
  copy,
  publisher,
  series,
  subcategory,
} from "@/db/schema";
import type {
  Book,
  BookCollaborator,
  BookCollaboratorDetail,
  BookListFilters,
  BookListItem,
  BookPatch,
  BookUsage,
  BookWithCollaborators,
  NewBook,
} from "./types";
import { RELEASED_STATUSES } from "@/features/inventory/copy/types";
import type { Page } from "@/shared/types/types";

// References
const copies: Reference = { table: copy, column: copy.bookId };
const copyCount = rowCount(copies, book.id);
const activeCount = rowCount(
  { ...copies, where: notInArray(copy.status, [...RELEASED_STATUSES]) },
  book.id,
);
const availableCount = rowCount(
  { ...copies, where: eq(copy.status, "available") },
  book.id,
);

// Helpers
const matches = (column: AnyColumn | SQL, token: string) =>
  likeTokens(column, [token])[0];

const authorMatches = (token: string) =>
  exists(
    db
      .select({ one: sql`1` })
      .from(bookCollaborator)
      .innerJoin(author, eq(author.id, bookCollaborator.collaboratorId))
      .where(
        and(
          eq(bookCollaborator.bookId, book.id),
          matches(author.nameKey, token),
        ),
      ),
  );

const filterBy = (column: AnyColumn, value: number | boolean | undefined) =>
  value === undefined ? undefined : eq(column, value);

const roleOrder = sql`case ${bookCollaborator.role}
  when 'writer' then 0 when 'illustrator' then 1 else 2 end`;

async function collaboratorsOf(
  bookIds: number[],
): Promise<Map<number, BookCollaboratorDetail[]>> {
  const byBook = new Map<number, BookCollaboratorDetail[]>();
  if (bookIds.length === 0) return byBook;

  const rows = await db
    .select({
      bookId: bookCollaborator.bookId,
      authorId: bookCollaborator.collaboratorId,
      role: bookCollaborator.role,
      firstName: author.firstName,
      lastName: author.lastName,
    })
    .from(bookCollaborator)
    .innerJoin(author, eq(author.id, bookCollaborator.collaboratorId))
    .where(inArray(bookCollaborator.bookId, bookIds))
    .orderBy(asc(bookCollaborator.bookId), roleOrder, asc(author.nameKey));

  for (const { bookId, ...detail } of rows) {
    const list = byBook.get(bookId);
    if (list) list.push(detail);
    else byBook.set(bookId, [detail]);
  }
  return byBook;
}

// Queries
export async function findBookById(id: number): Promise<Book | null> {
  const [row] = await db.select().from(book).where(eq(book.id, id));
  return row ?? null;
}

export async function findBookWithCollaborators(
  id: number,
): Promise<BookWithCollaborators | null> {
  const found = await findBookById(id);
  if (!found) return null;
  const byBook = await collaboratorsOf([id]);
  return { ...found, collaborators: byBook.get(id) ?? [] };
}

export async function listBooks(
  filters: BookListFilters,
): Promise<Page<BookListItem>> {
  const {
    tokens,
    authorId,
    role,
    publisherId,
    collectionId,
    seriesId,
    categoryId,
    subcategoryId,
    active,
    sortBy,
    sortDir,
    limit,
    offset,
  } = filters;

  const search = tokens.map((t) =>
    or(
      matches(book.titleKey, t),
      matches(publisher.nameKey, t),
      authorMatches(t),
    ),
  );

  const byCollaborator =
    authorId === undefined && role === undefined
      ? undefined
      : hasRows(
          {
            table: bookCollaborator,
            column: bookCollaborator.bookId,
            where: and(
              authorId === undefined
                ? undefined
                : eq(bookCollaborator.collaboratorId, authorId),
              role === undefined ? undefined : eq(bookCollaborator.role, role),
            ),
          },
          book.id,
        );

  const where = and(
    ...search,
    byCollaborator,
    filterBy(book.publisherId, publisherId),
    filterBy(book.collectionId, collectionId),
    filterBy(book.seriesId, seriesId),
    filterBy(book.categoryId, categoryId),
    filterBy(book.subcategoryId, subcategoryId),
    filterBy(book.active, active),
  );

  const sortKey = {
    title: book.titleKey,
    createdAt: book.createdAt,
    publicationYear: book.publicationYear,
    copyCount,
  }[sortBy];

  const [rows, [{ n }]] = await Promise.all([
    db
      .select({
        ...getTableColumns(book),
        publisherName: publisher.name,
        collectionName: collection.name,
        seriesName: series.name,
        categoryName: category.name,
        subcategoryName: subcategory.name,
        copyCount,
        activeCount,
        availableCount,
      })
      .from(book)
      .leftJoin(publisher, eq(book.publisherId, publisher.id))
      .leftJoin(collection, eq(book.collectionId, collection.id))
      .leftJoin(series, eq(book.seriesId, series.id))
      .leftJoin(category, eq(book.categoryId, category.id))
      .leftJoin(subcategory, eq(book.subcategoryId, subcategory.id))
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(book.titleKey), asc(book.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ n: count() })
      .from(book)
      .leftJoin(publisher, eq(book.publisherId, publisher.id))
      .where(where),
  ]);

  const byBook = await collaboratorsOf(rows.map((r) => r.id));
  const items = rows.map((r) => ({
    ...r,
    collaborators: byBook.get(r.id) ?? [],
  }));
  return toPage(items, n, filters);
}

export async function countBookUsage(id: number): Promise<BookUsage | null> {
  const [row] = await db
    .select({ copies: copyCount })
    .from(book)
    .where(eq(book.id, id));
  return row ?? null;
}

// Actions
const collaboratorRows = (bookId: number, list: BookCollaborator[]) =>
  list.map((c) => ({
    bookId,
    collaboratorId: c.authorId,
    role: c.role,
  }));

export function insertBookSync(
  ex: Executor,
  values: NewBook,
  collaborators: BookCollaborator[],
): Book {
  const row = ex.insert(book).values(values).returning().get();
  ex.insert(bookCollaborator)
    .values(collaboratorRows(row.id, collaborators))
    .run();
  return row;
}

export async function insertBook(
  values: NewBook,
  collaborators: BookCollaborator[],
): Promise<Book> {
  return db.transaction((tx) => insertBookSync(tx, values, collaborators));
}

export async function updateBook(
  id: number,
  patch: BookPatch,
  collaborators?: BookCollaborator[],
): Promise<Book | null> {
  return db.transaction((tx) => {
    const row = tx
      .update(book)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(book.id, id))
      .returning()
      .get();
    if (!row) return null;

    if (collaborators) {
      tx.delete(bookCollaborator).where(eq(bookCollaborator.bookId, id)).run();
      tx.insert(bookCollaborator)
        .values(collaboratorRows(id, collaborators))
        .run();
    }
    return row;
  });
}
