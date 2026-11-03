import { and, asc, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import {
  direction,
  hasNoRows,
  hasRows,
  likeTokens,
  rowCount,
  type Reference,
} from "@/db/helpers";
import { book, subcategory } from "@/db/schema";
import type {
  ReferenceListFilters,
  ReferenceUsage,
} from "../_shared/reference";
import type { Subcategory, SubcategoryWithBookCount } from "./types";

const books: Reference = { table: book, column: book.subcategoryId };
const bookCount = rowCount(books, subcategory.id);

export async function findSubcategoryById(
  id: number,
): Promise<Subcategory | null> {
  const [row] = await db
    .select()
    .from(subcategory)
    .where(eq(subcategory.id, id));
  return row ?? null;
}

export async function listSubcategories(
  filters: ReferenceListFilters,
): Promise<SubcategoryWithBookCount[]> {
  const { tokens, withBooks, sortBy, sortDir, limit, offset } = filters;

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? hasRows(books, subcategory.id)
        : hasNoRows(books, subcategory.id);

  const sortKey = {
    name: subcategory.nameKey,
    code: subcategory.code,
    bookCount,
  }[sortBy];

  return db
    .select({ ...getTableColumns(subcategory), bookCount })
    .from(subcategory)
    .where(and(...likeTokens(subcategory.nameKey, tokens), bookPresence))
    .orderBy(
      direction(sortDir)(sortKey),
      asc(subcategory.nameKey),
      asc(subcategory.id),
    )
    .limit(limit)
    .offset(offset);
}

export async function countSubcategoryUsage(
  id: number,
): Promise<ReferenceUsage | null> {
  const [row] = await db
    .select({ books: bookCount })
    .from(subcategory)
    .where(eq(subcategory.id, id));
  return row ?? null;
}
