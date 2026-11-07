import { and, asc, count, eq, getTableColumns } from "drizzle-orm";
import { db } from "@/db/client";
import {
  direction,
  hasNoReferences,
  hasNoRows,
  hasRows,
  likeTokens,
  rowCount,
  toPage,
  type Reference,
} from "@/db/helpers";
import { author, bookCollaborator, series } from "@/db/schema";
import type {
  Author,
  AuthorListFilters,
  AuthorUsage,
  AuthorWithBookCount,
  CollaboratorRole,
  NewAuthor,
} from "./types";
import { Page } from "@/shared/types/types";

// References
const collab: Reference = {
  table: bookCollaborator,
  column: bookCollaborator.collaboratorId,
};
const collabAs = (role: CollaboratorRole): Reference => ({
  ...collab,
  where: eq(bookCollaborator.role, role),
});
const authoredSeries: Reference = { table: series, column: series.authorId };

const bookCount = rowCount(collab, author.id, bookCollaborator.bookId);
const seriesCount = rowCount(authoredSeries, author.id);

// Queries
export async function findAuthorById(id: number): Promise<Author | null> {
  const [row] = await db.select().from(author).where(eq(author.id, id));
  return row ?? null;
}

export async function listAuthors(
  filters: AuthorListFilters,
): Promise<Page<AuthorWithBookCount>> {
  const { tokens, role, withBooks, sortBy, sortDir, limit, offset } = filters;

  const withRole = role ? hasRows(collabAs(role), author.id) : undefined;

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? hasRows(collab, author.id)
        : hasNoRows(collab, author.id);

  const where = and(
    ...likeTokens(author.nameKey, tokens),
    withRole,
    bookPresence,
  );

  const sortKey = {
    name: author.nameKey,
    createdAt: author.createdAt,
    bookCount,
  }[sortBy];

  const [items, [{ n }]] = await Promise.all([
    db
      .select({ ...getTableColumns(author), bookCount })
      .from(author)
      .where(where)
      .orderBy(direction(sortDir)(sortKey), asc(author.nameKey), asc(author.id))
      .limit(limit)
      .offset(offset),
    db.select({ n: count() }).from(author).where(where),
  ]);
  return toPage(items, n, filters);
}

export async function countAuthorUsage(
  id: number,
): Promise<AuthorUsage | null> {
  const [row] = await db
    .select({ books: bookCount, series: seriesCount })
    .from(author)
    .where(eq(author.id, id));
  return row ?? null;
}

// Actions
export async function insertAuthor(values: NewAuthor): Promise<Author> {
  const [row] = await db.insert(author).values(values).returning();
  return row;
}

export async function updateAuthor(
  id: number,
  patch: Partial<NewAuthor>,
): Promise<Author | null> {
  const [row] = await db
    .update(author)
    .set(patch)
    .where(eq(author.id, id))
    .returning();
  return row ?? null;
}

export async function deleteAuthorIfUnused(id: number): Promise<boolean> {
  const deleted = await db
    .delete(author)
    .where(
      and(
        eq(author.id, id),
        hasNoReferences(author.id, collab, authoredSeries),
      ),
    )
    .returning({ id: author.id });
  return deleted.length > 0;
}
