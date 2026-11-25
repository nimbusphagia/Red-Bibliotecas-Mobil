import { db } from "@/db/client";
import { direction, rowCount, toPage, type Reference } from "@/db/helpers";
import {
  account,
  book,
  copy,
  loanMovementLine,
  shelf,
  stockMovement,
  stockMovementLine,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { Page } from "@/features/shared/types/types";
import { alias } from "drizzle-orm/sqlite-core";
import { labelTextSql, writersSql } from "../copy/sql";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  isNull,
  lt,
  sql,
} from "drizzle-orm";
import { RECOVERABLE_REASONS } from "./types";
import type {
  ExitLine,
  MovementLine,
  MovementListFilters,
  MovementListItem,
  MovementMonth,
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

export type LineLinks = {
  loanLineByCopy?: Map<number, number>;
  recoveredLineByCopy?: Map<number, number>;
};

export function insertMovementLinesSync(
  ex: Executor,
  movementId: number,
  copyIds: number[],
  { loanLineByCopy, recoveredLineByCopy }: LineLinks = {},
): void {
  if (copyIds.length === 0) return;
  ex.insert(stockMovementLine)
    .values(
      copyIds.map((copyId) => ({
        movementId,
        copyId,
        loanLineId: loanLineByCopy?.get(copyId) ?? null,
        recoveredLineId: recoveredLineByCopy?.get(copyId) ?? null,
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

// Línea de recuperación que revierte una salida, y la salida revertida.
const recoveryLine = alias(stockMovementLine, "recovery_line");
const recoveredLine = alias(stockMovementLine, "recovered_line");

const selectMovements = () =>
  db
    .select({
      ...getTableColumns(stockMovement),
      signedByName: account.name,
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

const movementWhere = ({
  type,
  reason,
  signedById,
  from,
  until,
}: MovementListFilters) =>
  and(
    type === undefined ? undefined : eq(stockMovement.type, type),
    reason === undefined ? undefined : eq(stockMovement.reason, reason),
    signedById === undefined
      ? undefined
      : eq(stockMovement.signedById, signedById),
    from === undefined ? undefined : gte(stockMovement.createdAt, from),
    until === undefined ? undefined : lt(stockMovement.createdAt, until),
  );

export async function listMovements(
  filters: MovementListFilters,
): Promise<Page<MovementListItem>> {
  const { sortDir } = filters;
  const where = movementWhere(filters);

  const [items, [{ n }]] = await Promise.all([
    selectMovements()
      .where(where)
      .orderBy(
        direction(sortDir)(stockMovement.createdAt),
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
        authors: writersSql,
        copyNumber: copy.copyNumber,
        status: copy.status,
        shelfId: copy.shelfId,
        shelfName: shelf.name,
        labelText: labelTextSql,
        loanId: loanMovementLine.movementId,
        recoveryId: recoveryLine.movementId,
        recoveredExitId: recoveredLine.movementId,
      })
      .from(stockMovementLine)
      .innerJoin(copy, eq(copy.id, stockMovementLine.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .innerJoin(shelf, eq(shelf.id, copy.shelfId))
      .leftJoin(
        loanMovementLine,
        eq(loanMovementLine.id, stockMovementLine.loanLineId),
      )
      .leftJoin(
        recoveryLine,
        eq(recoveryLine.recoveredLineId, stockMovementLine.id),
      )
      .leftJoin(
        recoveredLine,
        eq(recoveredLine.id, stockMovementLine.recoveredLineId),
      )
      .where(where)
      .orderBy(asc(book.titleKey), asc(copy.copyNumber), asc(copy.id))
      .limit(page.limit)
      .offset(page.offset),
    db.select({ n: count() }).from(stockMovementLine).where(where),
  ]);
  return toPage(items, n, page);
}

const monthOf = sql<string>`strftime('%Y-%m', ${stockMovement.createdAt}, 'unixepoch', 'localtime')`;

const copiesOf = (type: StockMovement["type"]) =>
  sql<number>`coalesce(sum(case when ${stockMovement.type} = ${type} then ${copyCount} else 0 end), 0)`.mapWith(
    Number,
  );

export async function listMovementMonths(
  filters: MovementListFilters,
): Promise<MovementMonth[]> {
  return db
    .select({
      month: monthOf,
      entries: copiesOf("entry"),
      exits: copiesOf("exit"),
      movements: sql<number>`count(*)`.mapWith(Number),
    })
    .from(stockMovement)
    .where(movementWhere(filters))
    .groupBy(monthOf)
    .orderBy(direction(filters.sortDir)(monthOf));
}

/** La última salida por pérdida o daño del ejemplar que aún no se revirtió. */
export function findOpenExitLineSync(
  ex: Executor,
  copyId: number,
): ExitLine | null {
  const row = ex
    .select({
      id: stockMovementLine.id,
      reason: stockMovement.reason,
      copyId: copy.id,
      bookId: copy.bookId,
      copyNumber: copy.copyNumber,
      status: copy.status,
      labeledText: copy.labeledText,
    })
    .from(stockMovementLine)
    .innerJoin(
      stockMovement,
      eq(stockMovement.id, stockMovementLine.movementId),
    )
    .innerJoin(copy, eq(copy.id, stockMovementLine.copyId))
    .leftJoin(
      recoveryLine,
      eq(recoveryLine.recoveredLineId, stockMovementLine.id),
    )
    .where(
      and(
        eq(stockMovementLine.copyId, copyId),
        inArray(stockMovement.reason, [...RECOVERABLE_REASONS]),
        isNull(recoveryLine.id),
      ),
    )
    .orderBy(desc(stockMovementLine.id))
    .limit(1)
    .get();
  return row ?? null;
}
