import { db } from "@/db/client";
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
import type { Executor } from "@/db/transaction";
import { RELEASED_STATUSES } from "@/features/inventory/internal/copy/types";
import type { Page } from "@/features/shared/types/types";
import {
  and,
  asc,
  count,
  eq,
  ne,
  exists,
  getTableColumns,
  inArray,
  isNull,
  notInArray,
  or,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import { outdatedSql } from "@/features/inventory/internal/copy/sql";
import { bookLabelPrefixSql } from "./labelSql";
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
const onLoanCount = rowCount(
  { ...copies, where: eq(copy.status, "on_loan") },
  book.id,
);

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

const firstWriterKey = sql`(${db
  .select({ key: author.nameKey })
  .from(bookCollaborator)
  .innerJoin(author, eq(author.id, bookCollaborator.collaboratorId))
  .where(eq(bookCollaborator.bookId, book.id))
  .orderBy(roleOrder, asc(author.nameKey))
  .limit(1)})`;

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

const selectItems = () =>
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
      onLoanCount,
    })
    .from(book)
    .leftJoin(publisher, eq(book.publisherId, publisher.id))
    .leftJoin(collection, eq(book.collectionId, collection.id))
    .leftJoin(series, eq(book.seriesId, series.id))
    .leftJoin(category, eq(book.categoryId, category.id))
    .leftJoin(subcategory, eq(book.subcategoryId, subcategory.id));

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
    shelfId,
    active,
    labelState,
    sortBy,
    sortDir,
    limit,
    offset,
  } = filters;

  const search = tokens.map((t) =>
    or(
      matches(book.titleKey, t),
      matches(publisher.nameKey, t),
      matches(collection.nameKey, t),
      matches(series.nameKey, t),
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

  const byShelf =
    shelfId === undefined
      ? undefined
      : hasRows(
          {
            table: copy,
            column: copy.bookId,
            where: and(
              eq(copy.shelfId, shelfId),
              notInArray(copy.status, [...RELEASED_STATUSES]),
            ),
          },
          book.id,
        );

  const byLabelState =
    labelState === undefined
      ? undefined
      : hasRows(
          {
            table: copy,
            column: copy.bookId,
            where: and(
              notInArray(copy.status, [...RELEASED_STATUSES]),
              labelState === "pending" ? isNull(copy.labeledAt) : outdatedSql,
            ),
          },
          book.id,
        );

  const where = and(
    ...search,
    byCollaborator,
    byShelf,
    byLabelState,
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
    availableCount,
    author: firstWriterKey,
    publisher: publisher.nameKey,
  }[sortBy];

  const [rows, [{ n }]] = await Promise.all([
    selectItems()
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(book.titleKey), asc(book.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ n: count() })
      .from(book)
      .leftJoin(publisher, eq(book.publisherId, publisher.id))
      .leftJoin(collection, eq(book.collectionId, collection.id))
      .leftJoin(series, eq(book.seriesId, series.id))
      .where(where),
  ]);
  const byBook = await collaboratorsOf(rows.map((r) => r.id));
  const items = rows.map((r) => ({
    ...r,
    collaborators: byBook.get(r.id) ?? [],
  }));
  return toPage(items, n, filters);
}

export async function findBookItemById(
  id: number,
): Promise<BookListItem | null> {
  const [row] = await selectItems().where(eq(book.id, id));
  if (!row) return null;
  const byBook = await collaboratorsOf([id]);
  return { ...row, collaborators: byBook.get(id) ?? [] };
}

export async function countBookUsage(id: number): Promise<BookUsage | null> {
  const [row] = await db
    .select({ copies: copyCount })
    .from(book)
    .where(eq(book.id, id));
  return row ?? null;
}

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

export function updateBookSync(
  ex: Executor,
  id: number,
  patch: BookPatch,
  collaborators?: BookCollaborator[],
): Book | null {
  const row = ex
    .update(book)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(book.id, id))
    .returning()
    .get();
  if (!row) return null;

  if (collaborators) {
    ex.delete(bookCollaborator).where(eq(bookCollaborator.bookId, id)).run();
    ex.insert(bookCollaborator)
      .values(collaboratorRows(id, collaborators))
      .run();
  }
  return row;
}

/** Prefijo del tejuelo del libro, o null si aún no se puede armar. */
export function findLabelPrefixSync(
  ex: Executor,
  bookId: number,
): { prefix: string; titleCode: string; seriesId: number | null } | null {
  const row = ex
    .select({
      prefix: bookLabelPrefixSql,
      titleCode: book.titleCode,
      seriesId: book.seriesId,
    })
    .from(book)
    .where(eq(book.id, bookId))
    .get();
  if (!row || row.prefix === null || row.titleCode === null) return null;
  return { ...row, prefix: row.prefix, titleCode: row.titleCode };
}

/** Otro libro que ya usa ese prefijo, si existe. */
export function findBookByLabelPrefixSync(
  ex: Executor,
  prefix: string,
  titleCode: string,
  exceptBookId: number,
): { id: number; title: string; seriesId: number | null } | null {
  return (
    ex
      .select({ id: book.id, title: book.title, seriesId: book.seriesId })
      .from(book)
      .where(
        and(
          ne(book.id, exceptBookId),
          eq(book.titleCode, titleCode),
          sql`${bookLabelPrefixSql} = ${prefix}`,
        ),
      )
      .get() ?? null
  );
}

/**
 * Un ejemplar activo del libro (el de menor número) con su tejuelo completo:
 * el pegado, o el prefijo dado más su número si aún está pendiente.
 */
export function findLabeledCopySync(
  ex: Executor,
  bookId: number,
  prefix: string,
): { id: number; labelText: string } | null {
  const row = ex
    .select({
      id: copy.id,
      copyNumber: copy.copyNumber,
      labeledText: copy.labeledText,
    })
    .from(copy)
    .where(
      and(
        eq(copy.bookId, bookId),
        notInArray(copy.status, [...RELEASED_STATUSES]),
      ),
    )
    .orderBy(copy.copyNumber)
    .limit(1)
    .get();
  if (!row) return null;
  return {
    id: row.id,
    labelText: row.labeledText ?? `${prefix}-${row.copyNumber}`,
  };
}

export function findSeriesNameSync(ex: Executor, id: number): string | null {
  return (
    ex.select({ name: series.name }).from(series).where(eq(series.id, id)).get()
      ?.name ?? null
  );
}
