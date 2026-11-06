import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { book, copy, label } from "@/db/schema";
import type { Executor } from "@/db/transaction";
import {
  RELEASED_STATUSES,
  type Copy,
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
