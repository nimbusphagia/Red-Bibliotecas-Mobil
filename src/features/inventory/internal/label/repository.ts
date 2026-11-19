import { db } from "@/db/client";
import { direction, likeTokens, toPage } from "@/db/helpers";
import {
  author,
  book,
  bookCollaborator,
  copy,
  label,
  shelf,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { Page } from "@/features/shared/types/types";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import type {
  Label,
  LabelCodes,
  LabelItem,
  LabelListFilters,
  LabelOwner,
  LabelState,
  NewLabel,
} from "./types";

export function findBookTitleCodeSync(
  ex: Executor,
  bookId: number,
): string | null {
  const row = ex
    .select({ titleCode: label.titleCode })
    .from(label)
    .innerJoin(copy, eq(copy.id, label.copyId))
    .where(eq(copy.bookId, bookId))
    .orderBy(desc(label.id))
    .limit(1)
    .get();
  return row?.titleCode ?? null;
}

export function findActiveLabelOwnerSync(
  ex: Executor,
  text: string,
): LabelOwner | null {
  const row = ex
    .select({ bookId: book.id, title: book.title, seriesId: book.seriesId })
    .from(label)
    .innerJoin(copy, eq(copy.id, label.copyId))
    .innerJoin(book, eq(book.id, copy.bookId))
    .where(
      and(
        isNull(label.revokedAt),
        sql`lower(${label.text}) = ${text.toLowerCase()}`,
      ),
    )
    .get();
  return row ?? null;
}

export function insertLabelsSync(ex: Executor, values: NewLabel[]): Label[] {
  return ex.insert(label).values(values).returning().all();
}

export function revokeLabelsSync(ex: Executor, copyIds: number[]): void {
  if (copyIds.length === 0) return;
  ex.update(label)
    .set({ revokedAt: new Date() })
    .where(and(inArray(label.copyId, copyIds), isNull(label.revokedAt)))
    .run();
}

const textKey = sql`lower(${label.text})`;

const writerName = sql<string | null>`(${db
  .select({
    name: sql<string>`${author.firstName} || coalesce(' ' || ${author.lastName}, '')`,
  })
  .from(bookCollaborator)
  .innerJoin(author, eq(author.id, bookCollaborator.collaboratorId))
  .where(
    and(
      eq(bookCollaborator.bookId, book.id),
      eq(bookCollaborator.role, "writer"),
    ),
  )
  .orderBy(asc(author.nameKey))
  .limit(1)})`;

export async function listLabels(
  filters: LabelListFilters,
): Promise<Page<LabelItem>> {
  const {
    tokens,
    printStatus,
    shelfId,
    bookId,
    includeRevoked,
    sortBy,
    sortDir,
  } = filters;

  const where = and(
    includeRevoked ? undefined : isNull(label.revokedAt),
    printStatus === undefined ? undefined : eq(label.printStatus, printStatus),
    shelfId === undefined ? undefined : eq(copy.shelfId, shelfId),
    bookId === undefined ? undefined : eq(copy.bookId, bookId),
    ...tokens.map((t) =>
      or(...likeTokens(textKey, [t]), ...likeTokens(book.titleKey, [t])),
    ),
  );
  const sortKey = {
    createdAt: label.createdAt,
    printedAt: label.printedAt,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        id: label.id,
        copyId: label.copyId,
        bookId: book.id,
        bookTitle: book.title,
        authorName: writerName,
        shelfName: shelf.name,
        shelfIsDefault: shelf.isDefault,
        copyNumber: label.copyNumber,
        text: label.text,
        printStatus: label.printStatus,
        printedAt: label.printedAt,
        revision: label.revision,
        revoked: sql<boolean>`${label.revokedAt} is not null`.mapWith(Boolean),
      })
      .from(label)
      .innerJoin(copy, eq(copy.id, label.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .innerJoin(shelf, eq(shelf.id, copy.shelfId))
      .where(where)
      .orderBy(
        sql`${sortKey} is null`,
        direction(sortDir)(sortKey),
        asc(label.id),
      )
      .limit(filters.limit)
      .offset(filters.offset),
    db
      .select({ n: count() })
      .from(label)
      .innerJoin(copy, eq(copy.id, label.copyId))
      .innerJoin(book, eq(book.id, copy.bookId))
      .where(where),
  ]);
  return toPage(items, n, filters);
}

export function findLabelStatesSync(ex: Executor, ids: number[]): LabelState[] {
  if (ids.length === 0) return [];
  return ex
    .select({
      id: label.id,
      revoked: sql<boolean>`${label.revokedAt} is not null`.mapWith(Boolean),
    })
    .from(label)
    .where(inArray(label.id, ids))
    .all();
}

export function markLabelsPrintedSync(ex: Executor, ids: number[]): number {
  if (ids.length === 0) return 0;
  return ex
    .update(label)
    .set({ printStatus: "printed", printedAt: new Date() })
    .where(
      and(
        inArray(label.id, ids),
        eq(label.printStatus, "pending_print"),
        isNull(label.revokedAt),
      ),
    )
    .returning({ id: label.id })
    .all().length;
}

export async function findBookLabelCodes(
  bookId: number,
): Promise<LabelCodes | null> {
  const [row] = await db
    .select({
      categoryCode: label.categoryCode,
      authorCode: label.authorCode,
      subcategoryCode: label.subcategoryCode,
      titleCode: label.titleCode,
    })
    .from(label)
    .innerJoin(copy, eq(copy.id, label.copyId))
    .where(eq(copy.bookId, bookId))
    .orderBy(sql`${label.revokedAt} is not null`, desc(label.id))
    .limit(1);
  return row ?? null;
}
