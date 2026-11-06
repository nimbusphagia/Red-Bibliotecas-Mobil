import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { book, copy, label } from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { Label, LabelOwner, NewLabel } from "./types";

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
