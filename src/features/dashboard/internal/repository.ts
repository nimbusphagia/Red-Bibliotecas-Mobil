import { db } from "@/db/client";
import {
  book,
  copy,
  loanMovement,
  loanMovementLine,
  visitor,
} from "@/db/schema";
import { outdatedSql } from "@/features/inventory/internal/copy/sql";
import { RELEASED_STATUSES } from "@/features/inventory/internal/copy/types";
import {
  and,
  asc,
  between,
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
import type { HeldStatus } from "./types";

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

function listOpenLoansByExpiry(where: SQL | undefined, limit: number) {
  return db
    .select({
      id: loanMovement.id,
      visitorName: visitor.name,
      expiresBy: loanMovement.expiresBy,
    })
    .from(loanMovement)
    .innerJoin(visitor, eq(visitor.id, loanMovement.loanedToId))
    .innerJoin(loanMovementLine, openLineOfLoan)
    .where(where)
    .groupBy(loanMovement.id)
    .orderBy(asc(loanMovement.expiresBy), asc(loanMovement.id))
    .limit(limit);
}

export const listOldestOverdue = (today: string, limit: number) =>
  listOpenLoansByExpiry(lt(loanMovement.expiresBy, today), limit);

export const listDueSoon = (today: string, soon: string, limit: number) =>
  listOpenLoansByExpiry(between(loanMovement.expiresBy, today, soon), limit);

// Un disponible deteriorado cuenta como deteriorado; prestado, como prestado.
const heldStatusSql = sql<HeldStatus>`case when ${copy.status} = 'available' and ${copy.damagedAt} is not null then 'damaged' else ${copy.status} end`;

export function countHeldCopies() {
  return db
    .select({
      status: heldStatusSql,
      n: count(),
      unlabeled: sumIf(isNull(copy.labeledAt)),
      outdated: sumIf(outdatedSql),
    })
    .from(copy)
    .innerJoin(book, eq(book.id, copy.bookId))
    .where(notInArray(copy.status, [...RELEASED_STATUSES]))
    .groupBy(heldStatusSql);
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
