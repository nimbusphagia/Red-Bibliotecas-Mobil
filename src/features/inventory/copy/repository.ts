import { and, eq, notInArray } from "drizzle-orm";
import { copy } from "@/db/schema";
import type { Executor } from "@/db/transaction";
import { RELEASED_STATUSES, type Copy, type NewCopy } from "./types";

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
