import { db } from "@/db/client";
import {
  direction,
  hasNoReferences,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import {
  loanMovement,
  loanMovementLine,
  schoolGrade,
  stockMovementLine,
  visitor,
} from "@/db/schema";
import { subMonths } from "date-fns";
import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  gte,
  isNull,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type { Page } from "@/features/shared/types/types";
import type { LineOutcome } from "../loan/types";
import {
  HISTORY_MONTHS,
  LATE_GRACE_DAYS,
  type LineHistory,
} from "./reputation";
import type {
  NewVisitor,
  Visitor,
  VisitorListFilters,
  VisitorPatch,
  VisitorRow,
  VisitorUsage,
} from "./types";

const loans: Reference = {
  table: loanMovement,
  column: loanMovement.loanedToId,
};

export async function findVisitorById(id: number): Promise<Visitor | null> {
  const [row] = await db.select().from(visitor).where(eq(visitor.id, id));
  return row ?? null;
}

const allLines = sql<number>`(${db
  .select({ n: count() })
  .from(loanMovementLine)
  .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
  .where(eq(loanMovement.loanedToId, visitor.id))})`.mapWith(Number);

const pendingLines = sql<number>`(${db
  .select({ n: count() })
  .from(loanMovementLine)
  .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
  .where(
    and(
      eq(loanMovement.loanedToId, visitor.id),
      isNull(loanMovementLine.resolvedAt),
    ),
  )})`.mapWith(Number);

const exitLine = alias(stockMovementLine, "exit_line");
const recoveryLine = alias(stockMovementLine, "recovery_line");

const countWhen = (cond: SQL) =>
  sql<number>`count(case when ${cond} then 1 end)`;
const outcomeIs = (outcome: LineOutcome) =>
  eq(loanMovementLine.outcome, outcome);

const returnedLate = sql`date(${loanMovementLine.resolvedAt}, 'unixepoch', 'localtime') > date(${loanMovement.expiresBy}, ${`+${LATE_GRACE_DAYS} days`})`;

// Una pérdida recuperada cuenta como devolución normal.
const lineHistory = (where: SQL) =>
  db
    .select({
      visitorId: loanMovement.loanedToId,
      resolved: count().as("resolved"),
      late: countWhen(and(outcomeIs("returned"), returnedLate)!).as("late"),
      damaged: countWhen(outcomeIs("returned_damaged")).as("damaged"),
      discarded: countWhen(outcomeIs("discarded")).as("discarded"),
      lost: countWhen(and(outcomeIs("lost"), isNull(recoveryLine.id))!).as(
        "lost",
      ),
    })
    .from(loanMovementLine)
    .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
    .leftJoin(exitLine, eq(exitLine.loanLineId, loanMovementLine.id))
    .leftJoin(recoveryLine, eq(recoveryLine.recoveredLineId, exitLine.id))
    .where(where)
    .groupBy(loanMovement.loanedToId);

const orZero = (column: SQL.Aliased<number>) =>
  sql<number>`coalesce(${column}, 0)`.mapWith(Number);

const selectVisitors = () => {
  const since = subMonths(new Date(), HISTORY_MONTHS);
  const history = lineHistory(gte(loanMovementLine.resolvedAt, since)).as(
    "history",
  );
  return db
    .select({
      ...getTableColumns(visitor),
      grade: schoolGrade.grade,
      level: schoolGrade.level,
      lineCount: allLines,
      pendingCount: pendingLines,
      history: {
        resolved: orZero(history.resolved),
        late: orZero(history.late),
        damaged: orZero(history.damaged),
        discarded: orZero(history.discarded),
        lost: orZero(history.lost),
      },
    })
    .from(visitor)
    .leftJoin(schoolGrade, eq(visitor.gradeId, schoolGrade.id))
    .leftJoin(history, eq(history.visitorId, visitor.id));
};

export async function findVisitorItemById(
  id: number,
): Promise<VisitorRow | null> {
  const [row] = await selectVisitors().where(eq(visitor.id, id));
  return row ?? null;
}

export async function findVisitorHistory(
  id: number,
): Promise<LineHistory | null> {
  const [row] = await lineHistory(eq(loanMovement.loanedToId, id));
  if (!row) return null;
  const { visitorId: _, ...history } = row;
  return history;
}

export async function listVisitors(
  filters: VisitorListFilters,
): Promise<Page<VisitorRow>> {
  const { tokens, role, gradeId, active, sortBy, sortDir, limit, offset } =
    filters;

  const where = and(
    ...likeTokens(visitor.nameKey, tokens),
    role === undefined ? undefined : eq(visitor.role, role),
    gradeId === undefined ? undefined : eq(visitor.gradeId, gradeId),
    active === undefined ? undefined : eq(visitor.active, active),
  );

  const sortKey = { name: visitor.nameKey, createdAt: visitor.createdAt }[
    sortBy
  ];

  const [items, [{ n }]] = await Promise.all([
    selectVisitors()
      .where(where)
      .orderBy(
        direction(sortDir)(sortKey),
        asc(visitor.nameKey),
        asc(visitor.id),
      )
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(visitor).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countVisitorUsage(
  id: number,
): Promise<VisitorUsage | null> {
  const [row] = await db
    .select({ loans: rowCount(loans, visitor.id) })
    .from(visitor)
    .where(eq(visitor.id, id));
  return row ?? null;
}

export async function insertVisitor(values: NewVisitor): Promise<Visitor> {
  const [row] = await db.insert(visitor).values(values).returning();
  return row;
}

export async function updateVisitor(
  id: number,
  patch: VisitorPatch,
): Promise<Visitor | null> {
  const [row] = await db
    .update(visitor)
    .set(patch)
    .where(eq(visitor.id, id))
    .returning();
  return row ?? null;
}

export async function deleteVisitorIfUnused(id: number): Promise<boolean> {
  const deleted = await db
    .delete(visitor)
    .where(and(eq(visitor.id, id), hasNoReferences(visitor.id, loans)))
    .returning({ id: visitor.id });
  return deleted.length > 0;
}
