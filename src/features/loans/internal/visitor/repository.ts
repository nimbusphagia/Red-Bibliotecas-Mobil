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
  visitor,
} from "@/db/schema";
import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import type { Page } from "@/features/shared/types/types";
import type {
  NewVisitor,
  Visitor,
  VisitorListFilters,
  VisitorListItem,
  VisitorPatch,
  VisitorUsage,
} from "./types";
import { LineOutcome } from "../loan/types";

const loans: Reference = {
  table: loanMovement,
  column: loanMovement.loanedToId,
};

export async function findVisitorById(id: number): Promise<Visitor | null> {
  const [row] = await db.select().from(visitor).where(eq(visitor.id, id));
  return row ?? null;
}

const linesOf = (...outcomes: LineOutcome[]) =>
  sql<number>`(${db
    .select({ n: count() })
    .from(loanMovementLine)
    .innerJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
    .where(
      and(
        eq(loanMovement.loanedToId, visitor.id),
        outcomes.length
          ? inArray(loanMovementLine.outcome, outcomes)
          : undefined,
      ),
    )})`.mapWith(Number);

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

const selectVisitors = () =>
  db
    .select({
      ...getTableColumns(visitor),
      grade: schoolGrade.grade,
      level: schoolGrade.level,
      lineCount: linesOf(),
      pendingCount: pendingLines,
      problemCount: linesOf("returned_damaged", "discarded", "lost"),
    })
    .from(visitor)
    .leftJoin(schoolGrade, eq(visitor.gradeId, schoolGrade.id));

export async function findVisitorItemById(
  id: number,
): Promise<VisitorListItem | null> {
  const [row] = await selectVisitors().where(eq(visitor.id, id));
  return row ?? null;
}

export async function listVisitors(
  filters: VisitorListFilters,
): Promise<Page<VisitorListItem>> {
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
