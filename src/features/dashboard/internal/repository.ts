import { db } from "@/db/client";
import { copy, loanMovement, loanMovementLine, visitor } from "@/db/schema";
import { RELEASED_STATUSES } from "@/features/inventory/internal/copy/types";
import {
  and,
  asc,
  count,
  countDistinct,
  eq,
  gte,
  isNull,
  lt,
  notInArray,
  sql,
  type SQL,
} from "drizzle-orm";

const openLineOfLoan = and(
  eq(loanMovementLine.movementId, loanMovement.id),
  isNull(loanMovementLine.resolvedAt),
);

const sumIf = (cond: SQL) =>
  sql<number>`sum(case when ${cond} then 1 else 0 end)`.mapWith(Number);

export async function countOpenLoans(today: string, soon: string) {
  const [row] = await db
    .select({
      overdue: countDistinct(
        sql`case when ${loanMovement.expiresBy} < ${today} then ${loanMovement.id} end`,
      ),
      dueSoon: countDistinct(
        sql`case when ${loanMovement.expiresBy} between ${today} and ${soon} then ${loanMovement.id} end`,
      ),
    })
    .from(loanMovement)
    .innerJoin(loanMovementLine, openLineOfLoan);
  return row;
}

export function listOldestOverdue(today: string, limit: number) {
  return db
    .select({
      id: loanMovement.id,
      visitorName: visitor.name,
      expiresBy: loanMovement.expiresBy,
    })
    .from(loanMovement)
    .innerJoin(visitor, eq(visitor.id, loanMovement.loanedToId))
    .innerJoin(loanMovementLine, openLineOfLoan)
    .where(lt(loanMovement.expiresBy, today))
    .groupBy(loanMovement.id)
    .orderBy(asc(loanMovement.expiresBy), asc(loanMovement.id))
    .limit(limit);
}

export function countHeldCopies() {
  return db
    .select({
      status: copy.status,
      n: count(),
      unlabeled: sumIf(isNull(copy.labeledAt)),
    })
    .from(copy)
    .where(notInArray(copy.status, [...RELEASED_STATUSES]))
    .groupBy(copy.status);
}

export function countLoanLinesByMonth(from: Date, until: Date) {
  const month =
    sql<number>`cast(strftime('%m', ${loanMovementLine.createdAt}, 'unixepoch', 'localtime') as integer)`.mapWith(
      Number,
    );
  return db
    .select({ month, n: count() })
    .from(loanMovementLine)
    .where(
      and(
        gte(loanMovementLine.createdAt, from),
        lt(loanMovementLine.createdAt, until),
      ),
    )
    .groupBy(month);
}
