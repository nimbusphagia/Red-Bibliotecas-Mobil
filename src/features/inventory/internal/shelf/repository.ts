import { db } from "@/db/client";
import {
  direction,
  hasNoReferences,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import { book, copy, shelf } from "@/db/schema";
import { labelTextSql, writersSql } from "../copy/sql";
import type { Executor } from "@/db/transaction";
import type { Page } from "@/features/shared/types/types";
import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import { RELEASED_STATUSES } from "../copy/types";
import type {
  NewShelf,
  Shelf,
  ShelfCopy,
  ShelfListFilters,
  ShelfListItem,
  ShelfPatch,
  ShelfUsage,
} from "./types";

const copies: Reference = { table: copy, column: copy.shelfId };
const activeCopies: Reference = {
  ...copies,
  where: notInArray(copy.status, [...RELEASED_STATUSES]),
};

const copyUsage = rowCount(copies, shelf.id);
const activeCopyCount = rowCount(activeCopies, shelf.id);

export async function findShelfById(id: number): Promise<Shelf | null> {
  const [row] = await db.select().from(shelf).where(eq(shelf.id, id));
  return row ?? null;
}

export function findShelfByIdSync(ex: Executor, id: number): Shelf | null {
  return ex.select().from(shelf).where(eq(shelf.id, id)).get() ?? null;
}

export function findDefaultShelfSync(ex: Executor): Shelf | null {
  return ex.select().from(shelf).where(eq(shelf.isDefault, true)).get() ?? null;
}

export async function listShelves(
  filters: ShelfListFilters,
): Promise<Page<ShelfListItem>> {
  const { tokens, sortBy, sortDir, limit, offset } = filters;
  const where = and(...likeTokens(shelf.nameKey, tokens));
  const sortKey = {
    name: shelf.nameKey,
    copyCount: activeCopyCount,
    createdAt: shelf.createdAt,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({ ...getTableColumns(shelf), copyCount: activeCopyCount })
      .from(shelf)
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(shelf.nameKey), asc(shelf.id))
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(shelf).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countShelfUsage(id: number): Promise<ShelfUsage | null> {
  const [row] = await db
    .select({ copies: copyUsage })
    .from(shelf)
    .where(eq(shelf.id, id));
  return row ?? null;
}

export async function insertShelf(values: NewShelf): Promise<Shelf> {
  const [row] = await db.insert(shelf).values(values).returning();
  return row;
}

export async function updateShelf(
  id: number,
  patch: ShelfPatch,
): Promise<Shelf | null> {
  const [row] = await db
    .update(shelf)
    .set(patch)
    .where(eq(shelf.id, id))
    .returning();
  return row ?? null;
}

export async function deleteShelfIfUnused(id: number): Promise<boolean> {
  const deleted = await db
    .delete(shelf)
    .where(
      and(
        eq(shelf.id, id),
        eq(shelf.isDefault, false),
        hasNoReferences(shelf.id, copies),
      ),
    )
    .returning({ id: shelf.id });
  return deleted.length > 0;
}
export async function listShelfCopies(
  shelfId: number,
  filters: { tokens: string[]; copyId?: number; limit: number; offset: number },
): Promise<Page<ShelfCopy>> {
  const { tokens, copyId, ...page } = filters;
  const labelKey = sql`lower(${labelTextSql})`;
  const where = and(
    eq(copy.shelfId, shelfId),
    notInArray(copy.status, [...RELEASED_STATUSES]),
    copyId === undefined ? undefined : eq(copy.id, copyId),
    ...tokens.map((t) =>
      or(...likeTokens(labelKey, [t]), ...likeTokens(book.titleKey, [t])),
    ),
  );

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        id: copy.id,
        bookId: copy.bookId,
        bookTitle: book.title,
        authors: writersSql,
        copyNumber: copy.copyNumber,
        status: copy.status,
        labelText: labelTextSql,
      })
      .from(copy)
      .innerJoin(book, eq(book.id, copy.bookId))
      .where(where)
      .orderBy(asc(book.titleKey), asc(copy.copyNumber), asc(copy.id))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ n: count() })
      .from(copy)
      .innerJoin(book, eq(book.id, copy.bookId))
      .where(where),
  ]);
  return toPage(items as ShelfCopy[], n, page);
}
