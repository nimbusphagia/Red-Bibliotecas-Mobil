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
import { book, category } from "@/db/schema";
import type {
  ReferenceListFilters,
  ReferenceUsage,
} from "../_shared/reference";
import type { Category, CategoryWithBookCount } from "./types";

const books: Reference = { table: book, column: book.categoryId };
const bookCount = rowCount(books, category.id);

export async function findCategoryById(id: number): Promise<Category | null> {
  const [row] = await db.select().from(category).where(eq(category.id, id));
  return row ?? null;
}

export async function listCategories(
  filters: ReferenceListFilters,
): Promise<CategoryWithBookCount[]> {
  const { tokens, withBooks, sortBy, sortDir, limit, offset } = filters;

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? hasRows(books, category.id)
        : hasNoRows(books, category.id);

  const sortKey = {
    name: category.nameKey,
    code: category.code,
    bookCount,
  }[sortBy];

  return db
    .select({ ...getTableColumns(category), bookCount })
    .from(category)
    .where(and(...likeTokens(category.nameKey, tokens), bookPresence))
    .orderBy(
      direction(sortDir)(sortKey),
      asc(category.nameKey),
      asc(category.id),
    )
    .limit(limit)
    .offset(offset);
}

export async function countCategoryUsage(
  id: number,
): Promise<ReferenceUsage | null> {
  const [row] = await db
    .select({ books: bookCount })
    .from(category)
    .where(eq(category.id, id));
  return row ?? null;
}
