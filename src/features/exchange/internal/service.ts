import { inTransaction } from "@/db/transaction";
import { requireStockRole } from "@/features/inventory/internal/movement/utils/auth";
import {
  insertEntryMovementSync,
  insertMovementLinesSync,
} from "@/features/inventory/internal/movement/repository";
import { isDataViolation } from "@/features/shared/errors/db-errors";
import { CatalogImportError } from "@/features/shared/errors/errors";
import { formatDateES } from "@/features/shared/format/dates";
import { sql } from "drizzle-orm";
import migrations from "../../../../drizzle/migrations";
import {
  clearCatalogSync,
  countLoansSync,
  insertRowsSync,
  selectRowsSync,
  TABLES,
} from "./repository";
import { CATALOG_APP, CATALOG_FORMAT, catalogFileSchema } from "./schemas";
import type { CatalogFile, CatalogSummary, Row, TableName } from "./types";

const MIGRATION = migrations.journal.entries.at(-1)?.tag ?? "";
const NAMES = Object.keys(TABLES) as TableName[];

export async function exportCatalog(actorId: number): Promise<CatalogFile> {
  await requireStockRole(actorId, "export the catalog");
  const tables = inTransaction((tx) => {
    const out = {} as Record<TableName, Row[]>;
    for (const name of NAMES) {
      if (name !== "copy") out[name] = selectRowsSync(tx, name);
    }
    // Los perdidos y descartados no viajan; los prestados llegan disponibles.
    out.copy = selectRowsSync(
      tx,
      "copy",
      sql`status in ('available', 'on_loan')`,
    ).map((r) => ({ ...r, status: "available" }));
    return out;
  });
  return {
    app: CATALOG_APP,
    format: CATALOG_FORMAT,
    migration: MIGRATION,
    exportedAt: new Date().toISOString(),
    tables,
  };
}

export function parseCatalog(text: string): {
  file: CatalogFile;
  summary: CatalogSummary;
} {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new CatalogImportError("invalid_file", e);
  }
  const parsed = catalogFileSchema.safeParse(json);
  if (!parsed.success) {
    throw new CatalogImportError("invalid_file", parsed.error);
  }
  const file = parsed.data;
  if (file.migration !== MIGRATION) {
    throw new CatalogImportError("other_version");
  }
  return {
    file,
    summary: {
      exportedAt: file.exportedAt,
      books: file.tables.book.length,
      copies: file.tables.copy.length,
      shelves: file.tables.shelf.length,
    },
  };
}

/**
 * Reemplaza el catálogo, las estanterías y los ejemplares por los del
 * archivo. Se borra el historial de stock y se registra una sola entrada con
 * todos los ejemplares, firmada por quien importa.
 */
export async function importCatalog(
  actorId: number,
  file: CatalogFile,
): Promise<void> {
  const actor = await requireStockRole(actorId, "import the catalog");
  inTransaction((tx) => {
    if (countLoansSync(tx) > 0) throw new CatalogImportError("has_loans");
    try {
      clearCatalogSync(tx);
      for (const name of NAMES) {
        const rows =
          name === "copy"
            ? file.tables.copy.map((r) => ({
                ...r,
                labeled_by_id: r.labeled_text == null ? null : actor.id,
                damaged_by_id: r.damaged_at == null ? null : actor.id,
              }))
            : file.tables[name];
        insertRowsSync(tx, name, rows);
      }
      const movement = insertEntryMovementSync(tx, {
        reason: "other",
        signedById: actor.id,
        notes: `Catálogo importado (exportado el ${formatDateES(file.exportedAt, true)})`,
      });
      const ids = file.tables.copy.map((r) => Number(r.id));
      // Por debajo del límite de parámetros de SQLite.
      for (let i = 0; i < ids.length; i += 1000) {
        insertMovementLinesSync(tx, movement.id, ids.slice(i, i + 1000));
      }
    } catch (e) {
      if (isDataViolation(e)) throw new CatalogImportError("invalid_file", e);
      throw e;
    }
  });
}
