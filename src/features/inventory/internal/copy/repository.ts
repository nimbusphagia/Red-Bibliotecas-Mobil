import { db } from "@/db/client";
import { direction, likeTokens, toPage } from "@/db/helpers";
import {
  book,
  copy,
  loanMovement,
  loanMovementLine,
  shelf,
  visitor,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import { toISODate } from "@/features/shared/format/dates";
import type { Page } from "@/features/shared/types/types";
import {
  and,
  count,
  eq,
  inArray,
  isNotNull,
  isNull,
  not,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import {
  derivedLabelTextSql,
  labelTextSql,
  outdatedSql,
  writersSql,
} from "./sql";
import {
  RELEASED_STATUSES,
  type Copy,
  type CopyItem,
  type CopyItemRow,
  type CopyListFilters,
  type LabelCandidate,
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
      labelText: labelTextSql,
    })
    .from(copy)
    .innerJoin(book, eq(book.id, copy.bookId));
}

export function findCopiesByIdsSync(ex: Executor, ids: number[]): CopyLookup[] {
  if (ids.length === 0) return [];
  return selectLookup(ex).where(inArray(copy.id, ids)).all();
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
  authors: writersSql,
  copyNumber: copy.copyNumber,
  status: copy.status,
  notes: copy.notes,
  shelfId: copy.shelfId,
  shelfName: shelf.name,
  shelfIsDefault: shelf.isDefault,
  labelText: labelTextSql,
  labeledAt: copy.labeledAt,
  outdated: outdatedSql,
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

const textKey = sql`lower(${labelTextSql})`;

export async function listCopies(
  filters: CopyListFilters,
): Promise<Page<CopyItem>> {
  const {
    bookId,
    tokens,
    status,
    shelfId,
    labeled,
    outdated,
    excludeReleased,
    sortBy,
    sortDir,
    limit,
    offset,
  } = filters;

  const where = and(
    bookId === undefined ? undefined : eq(copy.bookId, bookId),
    status === undefined ? undefined : eq(copy.status, status),
    shelfId === undefined ? undefined : eq(copy.shelfId, shelfId),
    labeled === undefined
      ? undefined
      : labeled
        ? isNotNull(copy.labeledAt)
        : isNull(copy.labeledAt),
    outdated === undefined
      ? undefined
      : outdated
        ? outdatedSql
        : not(outdatedSql),
    excludeReleased
      ? notInArray(copy.status, [...RELEASED_STATUSES])
      : undefined,
    ...tokens.map((t) =>
      or(...likeTokens(textKey, [t]), ...likeTokens(book.titleKey, [t])),
    ),
  );

  const sortKey = {
    copyNumber: copy.copyNumber,
    status: copy.status,
    createdAt: copy.createdAt,
    labeledAt: copy.labeledAt,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    selectItems()
      .where(where)
      .orderBy(sql`${sortKey} is null`, direction(sortDir)(sortKey), copy.id)
      .limit(limit)
      .offset(offset),
    db
      .select({ n: count() })
      .from(copy)
      .innerJoin(book, eq(book.id, copy.bookId))
      .where(where),
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

export function findLabelCandidatesSync(
  ex: Executor,
  ids: number[],
): LabelCandidate[] {
  if (ids.length === 0) return [];
  return ex
    .select({
      id: copy.id,
      status: copy.status,
      labeledAt: copy.labeledAt,
      labeledText: copy.labeledText,
      derivedText: derivedLabelTextSql,
    })
    .from(copy)
    .innerJoin(book, eq(book.id, copy.bookId))
    .where(inArray(copy.id, ids))
    .all();
}

/** De estos textos, los que ya están pegados en un ejemplar activo (y en cuál). */
export function findLabeledTextsSync(
  ex: Executor,
  texts: string[],
): Map<string, number> {
  if (texts.length === 0) return new Map();
  const rows = ex
    .select({ id: copy.id, text: copy.labeledText })
    .from(copy)
    .where(
      and(
        inArray(copy.labeledText, texts),
        notInArray(copy.status, [...RELEASED_STATUSES]),
      ),
    )
    .all();
  return new Map(rows.map((r) => [r.text!, r.id]));
}

export function setCopyLabeledSync(
  ex: Executor,
  id: number,
  text: string,
  actorId: number,
): void {
  ex.update(copy)
    .set({ labeledText: text, labeledAt: new Date(), labeledById: actorId })
    .where(eq(copy.id, id))
    .run();
}
