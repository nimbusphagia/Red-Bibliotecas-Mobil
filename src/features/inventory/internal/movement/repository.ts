import { db } from "@/db/client";
import { direction, rowCount, toPage, type Reference } from "@/db/helpers";
import {
  account,
  book,
  copy,
  label,
  loanMovementLine,
  shelf,
  stockMovement,
  stockMovementLine,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { Page } from "@/features/shared/types/types";
import { and, asc, count, eq, getTableColumns, gte, lt } from "drizzle-orm";
import type {
  MovementLine,
  MovementListFilters,
  MovementListItem,
  NewEntryMovement,
  NewExitMovement,
  StockMovement,
} from "./types";

export function insertEntryMovementSync(
  ex: Executor,
  values: NewEntryMovement,
): StockMovement {
  return ex
    .insert(stockMovement)
    .values({ ...values, type: "entry" })
    .returning()
    .get();
}

export function insertMovementLinesSync(
  ex: Executor,
  movementId: number,
  copyIds: number[],
  loanLineByCopy?: Map<number, number>,
): void {
  if (copyIds.length === 0) return;
  ex.insert(stockMovementLine)
    .values(
      copyIds.map((copyId) => ({
        movementId,
        copyId,
        loanLineId: loanLineByCopy?.get(copyId) ?? null,
      })),
    )
    .run();
}
export function insertExitMovementSync(
  ex: Executor,
  values: NewExitMovement,
): StockMovement {
  return ex
    .insert(stockMovement)
    .values({ ...values, type: "exit" })
    .returning()
    .get();
}

const lineRefs: Reference = {
  table: stockMovementLine,
  column: stockMovementLine.movementId,
};
const copyCount = rowCount(lineRefs, stockMovement.id);

const selectMovements = () =>
  db
    .select({
      ...getTableColumns(stockMovement),
      signedByUsername: account.username,
      copyCount,
    })
    .from(stockMovement)
    .innerJoin(account, eq(account.id, stockMovement.signedById));

export async function findMovementById(
  id: number,
): Promise<MovementListItem | null> {
  const [row] = await selectMovements().where(eq(stockMovement.id, id));
  return row ?? null;
}

export async function listMovements(
  filters: MovementListFilters,
): Promise<Page<MovementListItem>> {
  const { type, reason, signedById, from, until, sortBy, sortDir } = filters;

  const where = and(
    type === undefined ? undefined : eq(stockMovement.type, type),
    reason === undefined ? undefined : eq(stockMovement.reason, reason),
    signedById === undefined
      ? undefined
      : eq(stockMovement.signedById, signedById),
    from === undefined ? undefined : gte(stockMovement.createdAt, from),
    until === undefined ? undefined : lt(stockMovement.createdAt, until),
  );

  const sortKey = { createdAt: stockMovement.createdAt, copyCount }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    selectMovements()
      .where(where)
      .orderBy(
        direction(sortDir)(sortKey),
        direction(sortDir)(stockMovement.id),
      )
      .limit(filters.limit)
      .offset(filters.offset),
    db.select({ n: count() }).from(stockMovement).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function listMovementLines(
  movementId: number,
  page: { limit: number; offset: number },
): Promise<Page<MovementLine>> {
  const where = eq(stockMovementLine.movementId, movementId);

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        id: stockMovementLine.id,
        copyId: copy.id,
        bookId: copy.bookId,
        bookTitle: book.title,
        copyNumber: copy.copyNumber,
        status: copy.status,
        shelfId: copy.shelfId,
        shelfName: shelf.name,
        labelText: label.text,
        loanId: loanMovementLine.movementId,
      })
      .from(stockMovementLine)
      .innerJoin(copy, eq(copy.id, stockMovementLine.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .innerJoin(shelf, eq(shelf.id, copy.shelfId))
      .leftJoin(label, eq(label.copyId, copy.id))
      .leftJoin(
        loanMovementLine,
        eq(loanMovementLine.id, stockMovementLine.loanLineId),
      )
      .where(where)
      .orderBy(asc(book.titleKey), asc(copy.copyNumber), asc(copy.id))
      .limit(page.limit)
      .offset(page.offset),
    db.select({ n: count() }).from(stockMovementLine).where(where),
  ]);
  return toPage(items, n, page);
}
