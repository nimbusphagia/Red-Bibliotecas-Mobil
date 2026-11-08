import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  gte,
  inArray,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db/client";
import {
  direction,
  hasNoRows,
  hasRows,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import {
  account,
  book,
  copy,
  label,
  loanMovement,
  loanMovementLine,
  visitor,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { Page } from "@/shared/types/types";
import type {
  LineOutcome,
  LoanLine,
  LoanListFilters,
  LoanListItem,
  LoanMovement,
  NewLoanMovement,
  OpenCounts,
  OpenLineFilters,
  OpenLoanLine,
} from "./types";

const lines: Reference = {
  table: loanMovementLine,
  column: loanMovementLine.movementId,
};
const openLines: Reference = {
  ...lines,
  where: isNull(loanMovementLine.resolvedAt),
};
const lineCount = rowCount(lines, loanMovement.id);
const openCount = rowCount(openLines, loanMovement.id);

// Writes
export function insertLoanMovementSync(
  ex: Executor,
  values: NewLoanMovement,
): LoanMovement {
  return ex.insert(loanMovement).values(values).returning().get();
}

export function insertLoanLinesSync(
  ex: Executor,
  movementId: number,
  copyIds: number[],
): void {
  ex.insert(loanMovementLine)
    .values(copyIds.map((copyId) => ({ movementId, copyId })))
    .run();
}

export function findOpenLinesByCopyIdsSync(
  ex: Executor,
  copyIds: number[],
): { copyId: number }[] {
  if (copyIds.length === 0) return [];
  return ex
    .select({ copyId: loanMovementLine.copyId })
    .from(loanMovementLine)
    .where(
      and(
        inArray(loanMovementLine.copyId, copyIds),
        isNull(loanMovementLine.resolvedAt),
      ),
    )
    .all();
}

export function resolveLinesSync(
  ex: Executor,
  copyIds: number[],
  outcome: LineOutcome,
  actorId: number,
): void {
  if (copyIds.length === 0) return;
  ex.update(loanMovementLine)
    .set({ resolvedAt: new Date(), resolvedById: actorId, outcome })
    .where(
      and(
        inArray(loanMovementLine.copyId, copyIds),
        isNull(loanMovementLine.resolvedAt),
      ),
    )
    .run();
}

export function countOpenLinesSync(
  ex: Executor,
  visitorId: number,
  today: string,
): OpenCounts {
  return (
    ex
      .select({
        open: count(),
        overdue:
          sql<number>`coalesce(sum(case when ${loanMovement.expiresBy} < ${today} then 1 else 0 end), 0)`.mapWith(
            Number,
          ),
      })
      .from(loanMovementLine)
      .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
      .where(
        and(
          eq(loanMovement.loanedToId, visitorId),
          isNull(loanMovementLine.resolvedAt),
        ),
      )
      .get() ?? { open: 0, overdue: 0 }
  );
}

// Reads
const selectLoans = () =>
  db
    .select({
      ...getTableColumns(loanMovement),
      visitorName: visitor.name,
      loanedByUsername: account.username,
      lineCount,
      openCount,
    })
    .from(loanMovement)
    .innerJoin(visitor, eq(visitor.id, loanMovement.loanedToId))
    .innerJoin(account, eq(account.id, loanMovement.loanedById));

const withOverdue = <R extends { openCount: number; expiresBy: string }>(
  row: R,
  today: string,
) => ({ ...row, overdue: row.openCount > 0 && row.expiresBy < today });

export async function findLoanById(
  id: number,
  today: string,
): Promise<LoanListItem | null> {
  const [row] = await selectLoans().where(eq(loanMovement.id, id));
  return row ? withOverdue(row, today) : null;
}

export async function listLoans(
  filters: LoanListFilters,
): Promise<Page<LoanListItem>> {
  const { tokens, visitorId, state, from, until, today, sortBy, sortDir } =
    filters;

  const byState =
    state === undefined
      ? undefined
      : state === "closed"
        ? hasNoRows(openLines, loanMovement.id)
        : and(
            hasRows(openLines, loanMovement.id),
            state === "overdue" ? lt(loanMovement.expiresBy, today) : undefined,
          );

  const where = and(
    ...likeTokens(visitor.nameKey, tokens),
    visitorId === undefined
      ? undefined
      : eq(loanMovement.loanedToId, visitorId),
    byState,
    from === undefined ? undefined : gte(loanMovement.createdAt, from),
    until === undefined ? undefined : lt(loanMovement.createdAt, until),
  );

  const sortKey = {
    createdAt: loanMovement.createdAt,
    expiresBy: loanMovement.expiresBy,
    visitor: visitor.nameKey,
  }[sortBy];

  const [rows, [{ n }]] = await Promise.all([
    selectLoans()
      .where(where)
      .orderBy(direction(sortDir)(sortKey), direction(sortDir)(loanMovement.id))
      .limit(filters.limit)
      .offset(filters.offset),
    db
      .select({ n: count() })
      .from(loanMovement)
      .innerJoin(visitor, eq(visitor.id, loanMovement.loanedToId))
      .where(where),
  ]);
  return toPage(
    rows.map((r) => withOverdue(r, today)),
    n,
    filters,
  );
}

export async function listLoanLines(
  loanId: number,
  page: { limit: number; offset: number },
): Promise<Page<LoanLine>> {
  const resolver = alias(account, "resolver");
  const where = eq(loanMovementLine.movementId, loanId);

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        id: loanMovementLine.id,
        copyId: loanMovementLine.copyId,
        bookId: copy.bookId,
        bookTitle: book.title,
        copyNumber: copy.copyNumber,
        labelText: label.text,
        resolvedAt: loanMovementLine.resolvedAt,
        outcome: loanMovementLine.outcome,
        resolvedByUsername: resolver.username,
      })
      .from(loanMovementLine)
      .innerJoin(copy, eq(copy.id, loanMovementLine.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .leftJoin(label, eq(label.copyId, copy.id))
      .leftJoin(resolver, eq(resolver.id, loanMovementLine.resolvedById))
      .where(where)
      .orderBy(
        asc(book.titleKey),
        asc(copy.copyNumber),
        asc(loanMovementLine.id),
      )
      .limit(page.limit)
      .offset(page.offset),
    db.select({ n: count() }).from(loanMovementLine).where(where),
  ]);
  return toPage(items, n, page);
}

export async function listOpenLines(
  filters: OpenLineFilters,
): Promise<Page<OpenLoanLine>> {
  const { tokens, visitorId, overdue, today, sortBy, sortDir } = filters;

  const where = and(
    isNull(loanMovementLine.resolvedAt),
    visitorId === undefined
      ? undefined
      : eq(loanMovement.loanedToId, visitorId),
    overdue === undefined
      ? undefined
      : overdue
        ? lt(loanMovement.expiresBy, today)
        : gte(loanMovement.expiresBy, today),
    ...tokens.map((t) =>
      or(
        ...likeTokens(visitor.nameKey, [t]),
        ...likeTokens(book.titleKey, [t]),
      ),
    ),
  );

  const sortKey = {
    expiresBy: loanMovement.expiresBy,
    visitor: visitor.nameKey,
    title: book.titleKey,
  }[sortBy];

  const [rows, [{ n }]] = await Promise.all([
    db
      .select({
        lineId: loanMovementLine.id,
        loanId: loanMovement.id,
        copyId: copy.id,
        bookId: copy.bookId,
        bookTitle: book.title,
        copyNumber: copy.copyNumber,
        labelText: label.text,
        visitorId: visitor.id,
        visitorName: visitor.name,
        loanedAt: loanMovement.createdAt,
        expiresBy: loanMovement.expiresBy,
      })
      .from(loanMovementLine)
      .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
      .innerJoin(visitor, eq(visitor.id, loanMovement.loanedToId))
      .innerJoin(copy, eq(copy.id, loanMovementLine.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .leftJoin(label, eq(label.copyId, copy.id))
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(loanMovementLine.id))
      .limit(filters.limit)
      .offset(filters.offset),
    db
      .select({ n: count() })
      .from(loanMovementLine)
      .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
      .innerJoin(visitor, eq(visitor.id, loanMovement.loanedToId))
      .innerJoin(copy, eq(copy.id, loanMovementLine.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .where(where),
  ]);
  return toPage(
    rows.map((r) => ({ ...r, overdue: r.expiresBy < today })),
    n,
    filters,
  );
}
