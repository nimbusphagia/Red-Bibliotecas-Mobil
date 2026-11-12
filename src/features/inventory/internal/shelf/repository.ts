import { db } from "@/db/client";
import {
  direction,
  hasNoReferences,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import { copy, shelf } from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { Page } from "@/features/shared/types/types";
import { and, asc, count, eq, getTableColumns, sql } from "drizzle-orm";
import type {
  NewShelf,
  Shelf,
  ShelfListFilters,
  ShelfListItem,
  ShelfPatch,
  ShelfUsage,
} from "./types";

const copies: Reference = { table: copy, column: copy.shelfId };
const copyCount = rowCount(copies, shelf.id);
const nameKey = sql`lower(${shelf.name})`;

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
  const where = and(...likeTokens(nameKey, tokens));
  const sortKey = { name: nameKey, copyCount, createdAt: shelf.createdAt }[
    sortBy
  ];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({ ...getTableColumns(shelf), copyCount })
      .from(shelf)
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(nameKey), asc(shelf.id))
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(shelf).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countShelfUsage(id: number): Promise<ShelfUsage | null> {
  const [row] = await db
    .select({ copies: copyCount })
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
