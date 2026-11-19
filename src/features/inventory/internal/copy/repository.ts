import { db } from "@/db/client";
import { direction, toPage } from "@/db/helpers";
import {
  book,
  copy,
  label,
  loanMovement,
  loanMovementLine,
  shelf,
  visitor,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import { toISODate } from "@/features/shared/format/dates";
import type { Page } from "@/features/shared/types/types";
import { and, count, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import type { CopyItemRow } from "./types";
import {
  RELEASED_STATUSES,
  type Copy,
  type CopyItem,
  type CopyListFilters,
  type CopyLookup,
  type CopyStatus,
  type NewCopy,
} from "./types";

export function activeCopyNumbersSync(ex: Executor, bookId: number): number[] {
  return ex
    .select({ n: copy.copyNumber })
    .from(copy)
    .where(
      and(
        eq(copy.bookId, bookId),
        notInArray(copy.status, [...RELEASED_STATUSES]),
      ),
    )
    .all()
    .map((r) => r.n);
}

export function insertCopiesSync(ex: Executor, values: NewCopy[]): Copy[] {
  return ex.insert(copy).values(values).returning().all();
}

function selectLookup(ex: Executor) {
  return ex
    .select({
      id: copy.id,
      bookId: copy.bookId,
      title: book.title,
      copyNumber: copy.copyNumber,
      shelfId: copy.shelfId,
      status: copy.status,
      labelText: label.text,
    })
    .from(copy)
    .innerJoin(book, eq(book.id, copy.bookId))
    .leftJoin(label, eq(label.copyId, copy.id));
}

export function findCopiesByIdsSync(ex: Executor, ids: number[]): CopyLookup[] {
  if (ids.length === 0) return [];
  return selectLookup(ex).where(inArray(copy.id, ids)).all();
}

export function findCopyByActiveLabelSync(
  ex: Executor,
  text: string,
): CopyLookup | null {
  return (
    selectLookup(ex)
      .where(
        and(
          isNull(label.revokedAt),
          sql`lower(${label.text}) = ${text.toLowerCase()}`,
        ),
      )
      .get() ?? null
  );
}

export function setCopiesStatusSync(
  ex: Executor,
  ids: number[],
  status: CopyStatus,
): void {
  if (ids.length === 0) return;
  ex.update(copy).set({ status }).where(inArray(copy.id, ids)).run();
}

const itemColumns = {
  id: copy.id,
  bookId: copy.bookId,
  bookTitle: book.title,
  copyNumber: copy.copyNumber,
  status: copy.status,
  notes: copy.notes,
  shelfId: copy.shelfId,
  shelfName: shelf.name,
  shelfIsDefault: shelf.isDefault,
  labelText: label.text,
  labelRevoked: sql<boolean>`${label.revokedAt} is not null`.mapWith(Boolean),
  loanId: loanMovement.id,
  visitorId: visitor.id,
  visitorName: visitor.name,
  expiresBy: loanMovement.expiresBy,
};

const selectItems = () =>
  db
    .select(itemColumns)
    .from(copy)
    .innerJoin(book, eq(book.id, copy.bookId))
    .innerJoin(shelf, eq(shelf.id, copy.shelfId))
    .leftJoin(label, eq(label.copyId, copy.id))
    .leftJoin(
      loanMovementLine,
      and(
        eq(loanMovementLine.copyId, copy.id),
        isNull(loanMovementLine.resolvedAt),
      ),
    )
    .leftJoin(loanMovement, eq(loanMovement.id, loanMovementLine.movementId))
    .leftJoin(visitor, eq(visitor.id, loanMovement.loanedToId));

function toItem(row: CopyItemRow): CopyItem {
  const { loanId, visitorId, visitorName, expiresBy, ...rest } = row;
  return {
    ...rest,
    loan:
      loanId === null
        ? null
        : {
            loanId,
            visitorId: visitorId!,
            visitorName: visitorName!,
            expiresBy: expiresBy!,
            overdue: expiresBy! < toISODate(),
          },
  };
}

export async function findCopyById(id: number): Promise<CopyItem | null> {
  const [row] = await selectItems().where(eq(copy.id, id));
  return row ? toItem(row) : null;
}

export async function listCopies(
  filters: CopyListFilters,
): Promise<Page<CopyItem>> {
  const {
    bookId,
    status,
    shelfId,
    excludeReleased,
    sortBy,
    sortDir,
    limit,
    offset,
  } = filters;

  const where = and(
    eq(copy.bookId, bookId),
    status === undefined ? undefined : eq(copy.status, status),
    shelfId === undefined ? undefined : eq(copy.shelfId, shelfId),
    excludeReleased
      ? notInArray(copy.status, [...RELEASED_STATUSES])
      : undefined,
  );

  const sortKey = {
    copyNumber: copy.copyNumber,
    status: copy.status,
    createdAt: copy.createdAt,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    selectItems()
      .where(where)
      .orderBy(direction(sortDir)(sortKey), copy.id)
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(copy).where(where),
  ]);
  return toPage(items.map(toItem), n, filters);
}

export function setCopiesShelfSync(
  ex: Executor,
  ids: number[],
  shelfId: number,
): void {
  if (ids.length === 0) return;
  ex.update(copy).set({ shelfId }).where(inArray(copy.id, ids)).run();
}
