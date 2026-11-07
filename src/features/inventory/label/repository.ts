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
import { db } from "@/db/client";
import { direction, likeTokens, toPage } from "@/db/helpers";
import { book, copy, label } from "@/db/schema";
import type { Page } from "@/shared/types/types";
import type { Executor } from "@/db/transaction";
import type {
  Label,
  LabelOwner,
  NewLabel,
  LabelItem,
  LabelListFilters,
  LabelState,
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

export async function listLabels(
  filters: LabelListFilters,
): Promise<Page<LabelItem>> {
  const { tokens, printStatus, bookId, includeRevoked, sortBy, sortDir } =
    filters;

  const where = and(
    includeRevoked ? undefined : isNull(label.revokedAt),
    printStatus === undefined ? undefined : eq(label.printStatus, printStatus),
    bookId === undefined ? undefined : eq(copy.bookId, bookId),
    ...tokens.map((t) =>
      or(...likeTokens(textKey, [t]), ...likeTokens(book.titleKey, [t])),
    ),
  );

  const sortKey = { createdAt: label.createdAt, text: textKey }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({
        id: label.id,
        copyId: label.copyId,
        bookId: book.id,
        bookTitle: book.title,
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
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(label.id))
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
