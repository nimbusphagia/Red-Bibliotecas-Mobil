import type { Page, SortDirection } from "@/shared/types/types";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  exists,
  notExists,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "./client";

export const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export const likeTokens = (column: AnyColumn | SQL, tokens: string[]) =>
  tokens.map((t) => sql`${column} like ${`%${escapeLike(t)}%`} escape '\\'`);

export const direction = (dir: SortDirection) => (dir === "desc" ? desc : asc);

export type Reference = { table: SQLiteTable; column: AnyColumn; where?: SQL };

const rowsOf = (ref: Reference, owner: AnyColumn) =>
  db
    .select({ one: sql`1` })
    .from(ref.table)
    .where(and(eq(ref.column, owner), ref.where));

export const hasRows = (ref: Reference, owner: AnyColumn) =>
  exists(rowsOf(ref, owner));

export const hasNoRows = (ref: Reference, owner: AnyColumn) =>
  notExists(rowsOf(ref, owner));

export const rowCount = (
  ref: Reference,
  owner: AnyColumn,
  distinct?: AnyColumn,
) =>
  sql<number>`(${db
    .select({ n: distinct ? countDistinct(distinct) : count() })
    .from(ref.table)
    .where(and(eq(ref.column, owner), ref.where))})`.mapWith(Number);

export const hasNoReferences = (owner: AnyColumn, ...refs: Reference[]) =>
  and(...refs.map((r) => notExists(rowsOf(r, owner))));

export const toPage = <T>(
  items: T[],
  total: number,
  { limit, offset }: { limit: number; offset: number },
): Page<T> => ({ items, total, limit, offset });
