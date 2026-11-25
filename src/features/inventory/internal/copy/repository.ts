import { db } from "@/db/client";
import { direction, likeTokens, toPage } from "@/db/helpers";
import {
  book,
  copy,
  loanMovement,
  loanMovementLine,
  publisher,
  shelf,
  visitor,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import { toISODate } from "@/features/shared/format/dates";
import type { Page } from "@/features/shared/types/types";
import {
  and,
  asc,
  count,
  eq,
  inArray,
  isNotNull,
  isNull,
  not,
  notInArray,
  or,
  sql,
  type SQL,
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
  type CopyBook,
  type CopyBookFilters,
  type CopyListFilters,
  type CopyMatch,
  type LabelCandidate,
  type CopyLookup,
  type CopyStatus,
  type CopySummary,
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

/** El ejemplar activo del libro que tiene ese número, si lo hay. */
export function findActiveCopyByNumberSync(
  ex: Executor,
  bookId: number,
  copyNumber: number,
): number | null {
  const row = ex
    .select({ id: copy.id })
    .from(copy)
    .where(
      and(
        eq(copy.bookId, bookId),
        eq(copy.copyNumber, copyNumber),
        notInArray(copy.status, [...RELEASED_STATUSES]),
      ),
    )
    .get();
  return row?.id ?? null;
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

/** Los que ya estaban deteriorados conservan su registro. */
export function markCopiesDamagedSync(
  ex: Executor,
  ids: number[],
  actorId: number,
): void {
  if (ids.length === 0) return;
  ex.update(copy)
    .set({ damagedAt: new Date(), damagedById: actorId })
    .where(and(inArray(copy.id, ids), isNull(copy.damagedAt)))
    .run();
}

export function clearCopyDamagedSync(ex: Executor, id: number): void {
  ex.update(copy)
    .set({ damagedAt: null, damagedById: null })
    .where(eq(copy.id, id))
    .run();
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
  damagedAt: copy.damagedAt,
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

const copyWhere = ({
  bookId,
  copyId,
  tokens,
  status,
  shelfId,
  labeled,
  outdated,
  excludeReleased,
}: CopyMatch) =>
  and(
    bookId === undefined ? undefined : eq(copy.bookId, bookId),
    copyId === undefined ? undefined : eq(copy.id, copyId),
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

export async function listCopies(
  filters: CopyListFilters,
): Promise<Page<CopyItem>> {
  const { sortBy, sortDir, limit, offset } = filters;
  const where = copyWhere(filters);

  const sortKey = {
    copyNumber: copy.copyNumber,
    status: copy.status,
    createdAt: copy.createdAt,
    labeledAt: copy.labeledAt,
    title: book.titleKey,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    selectItems()
      .where(where)
      .orderBy(
        sql`${sortKey} is null`,
        direction(sortDir)(sortKey),
        copy.copyNumber,
        copy.id,
      )
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

const tally = (cond: SQL | undefined) =>
  sql<number>`coalesce(sum(case when ${cond} then 1 else 0 end), 0)`.mapWith(
    Number,
  );

/** Conteos de los ejemplares que cumplen `match`. */
export async function summarizeCopies(match: CopyMatch): Promise<CopySummary> {
  const [row] = await db
    .select({
      total: count(),
      onLoan: tally(eq(copy.status, "on_loan")),
      damaged: tally(isNotNull(copy.damagedAt)),
      labeled: tally(and(isNotNull(copy.labeledAt), not(outdatedSql))),
      pending: tally(isNull(copy.labeledAt)),
      outdated: tally(outdatedSql),
    })
    .from(copy)
    .innerJoin(book, eq(book.id, copy.bookId))
    .where(copyWhere(match));
  return row;
}

const copyBookFields = {
  id: book.id,
  title: book.title,
  authors: writersSql,
  publisherName: publisher.name,
  labeled: tally(and(isNotNull(copy.labeledAt), not(outdatedSql))),
  pending: tally(and(isNotNull(copy.id), isNull(copy.labeledAt))),
  outdated: tally(outdatedSql),
};

/**
 * Libros activos, como en el catálogo, con los conteos de sus ejemplares
 * activos. Si se filtra por algo del ejemplar (ID, estante, etiquetado), solo
 * quedan los libros con al menos un ejemplar que cumple.
 */
export async function listCopyBooks(
  filters: CopyBookFilters,
): Promise<Page<CopyBook>> {
  const { sortBy, sortDir, limit, offset } = filters;
  const byCopy =
    filters.copyId !== undefined ||
    filters.shelfId !== undefined ||
    filters.labeled !== undefined ||
    filters.outdated !== undefined;
  const match = copyWhere(filters);
  const counted = byCopy ? and(isNotNull(copy.id), match) : match;
  const having =
    counted && sql`max(case when ${counted} then 1 else 0 end) = 1`;

  const order =
    sortBy === "author"
      ? [
          sql`${writersSql} is null`,
          direction(sortDir)(writersSql),
          asc(book.titleKey),
        ]
      : [direction(sortDir)(book.titleKey)];

  const copies = and(
    eq(copy.bookId, book.id),
    notInArray(copy.status, [...RELEASED_STATUSES]),
  );

  const matching = db
    .select({ id: book.id })
    .from(book)
    .leftJoin(copy, copies)
    .where(eq(book.active, true))
    .groupBy(book.id)
    .having(having)
    .as("matching");

  const [items, [{ n }]] = await Promise.all([
    db
      .select(copyBookFields)
      .from(book)
      .leftJoin(copy, copies)
      .leftJoin(publisher, eq(publisher.id, book.publisherId))
      .where(eq(book.active, true))
      .groupBy(book.id)
      .having(having)
      .orderBy(...order, book.id)
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(matching),
  ]);
  return toPage(items, n, filters);
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
