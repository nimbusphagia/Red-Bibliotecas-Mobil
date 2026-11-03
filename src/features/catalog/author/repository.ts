import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  exists,
  getTableColumns,
  notExists,
  sql,
} from "drizzle-orm";
import { db } from "@/db/client";
import { author, bookCollaborator, series } from "@/db/schema";
import type {
  Author,
  AuthorListFilters,
  AuthorUsage,
  AuthorWithBookCount,
  CollaboratorRole,
  NewAuthor,
} from "./types";

// SQL fragments
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const fullName = sql`(${author.firstName} || ' ' || coalesce(${author.lastName}, ''))`;

const collaborations = (role?: CollaboratorRole) =>
  db
    .select({ one: sql`1` })
    .from(bookCollaborator)
    .where(
      and(
        eq(bookCollaborator.collaboratorId, author.id),
        role ? eq(bookCollaborator.role, role) : undefined,
      ),
    );

const authoredSeries = () =>
  db
    .select({ one: sql`1` })
    .from(series)
    .where(eq(series.authorId, author.id));

const bookCount = sql<number>`(${db
  .select({ n: countDistinct(bookCollaborator.bookId) })
  .from(bookCollaborator)
  .where(eq(bookCollaborator.collaboratorId, author.id))})`.mapWith(Number);

const seriesCount = sql<number>`(${db
  .select({ n: count() })
  .from(series)
  .where(eq(series.authorId, author.id))})`.mapWith(Number);

const hasNoReferences = () =>
  and(notExists(collaborations()), notExists(authoredSeries()));

export async function findAuthorById(id: number): Promise<Author | null> {
  const [row] = await db.select().from(author).where(eq(author.id, id));
  return row ?? null;
}

// Queries
export async function listAuthors(
  filters: AuthorListFilters,
): Promise<AuthorWithBookCount[]> {
  const { tokens, role, withBooks, sortBy, sortDir, limit, offset } = filters;

  const withRole = role ? exists(collaborations(role)) : undefined;

  const bookPresence =
    withBooks === undefined
      ? undefined
      : withBooks
        ? exists(collaborations())
        : notExists(collaborations());

  const sortKey = {
    name: sql`lower(coalesce(${author.lastName}, ${author.firstName}))`,
    createdAt: author.createdAt,
    bookCount,
  }[sortBy];
  const direction = sortDir === "desc" ? desc : asc;

  return db
    .select({ ...getTableColumns(author), bookCount })
    .from(author)
    .where(
      and(
        ...tokens.map(
          (t) => sql`${fullName} like ${`%${escapeLike(t)}%`} escape '\\'`,
        ),
        withRole,
        bookPresence,
      ),
    )
    .orderBy(direction(sortKey), asc(author.firstName), asc(author.id))
    .limit(limit)
    .offset(offset);
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
    .where(and(eq(author.id, id), hasNoReferences()))
    .returning({ id: author.id });
  return deleted.length > 0;
}
