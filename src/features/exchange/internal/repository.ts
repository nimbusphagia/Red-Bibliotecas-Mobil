import { db } from "@/db/client";
import {
  author,
  book,
  bookCollaborator,
  category,
  collection,
  copy,
  loanMovement,
  publisher,
  series,
  shelf,
  stockMovement,
  stockMovementLine,
  subcategory,
} from "@/db/schema";
import type { Executor } from "@/db/transaction";
import { count, sql } from "drizzle-orm";
import { getTableConfig, type SQLiteTable } from "drizzle-orm/sqlite-core";
import type { Row, TableName } from "./types";

// En orden de inserción: cada tabla solo apunta a las anteriores.
export const TABLES = {
  author,
  publisher,
  collection,
  series,
  category,
  subcategory,
  book,
  book_collaborator: bookCollaborator,
  shelf,
  copy,
} satisfies Record<string, SQLiteTable>;

const columnsOf = (table: SQLiteTable) =>
  getTableConfig(table).columns.map((c) => c.name);

export function selectRowsSync(
  ex: Executor,
  name: TableName,
  where?: ReturnType<typeof sql>,
): Row[] {
  return ex.all<Row>(
    sql`select * from ${sql.identifier(name)}${where ? sql` where ${where}` : sql``}`,
  );
}

export function insertRowsSync(ex: Executor, name: TableName, rows: Row[]) {
  const columns = columnsOf(TABLES[name]);
  const head = sql.join(
    columns.map((c) => sql.identifier(c)),
    sql`, `,
  );
  for (const row of rows) {
    const values = sql.join(
      columns.map((c) => sql`${row[c] ?? null}`),
      sql`, `,
    );
    ex.run(
      sql`insert into ${sql.identifier(name)} (${head}) values (${values})`,
    );
  }
}

/** Borra catálogo, inventario y su historial de stock. */
export function clearCatalogSync(ex: Executor) {
  ex.delete(stockMovementLine).run();
  ex.delete(stockMovement).run();
  for (const table of Object.values(TABLES).reverse()) ex.delete(table).run();
}

export function countLoansSync(ex: Executor = db): number {
  return ex.select({ n: count() }).from(loanMovement).get()?.n ?? 0;
}
