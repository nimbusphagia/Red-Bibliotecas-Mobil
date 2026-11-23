import { collapse } from "@/features/shared/format/text";
import { MAX_LINES } from "../movement/schemas";
import {
  columnOfHeader,
  headerOf,
  IMPORT_COLUMNS,
  type ImportColumn,
} from "./columns";

export const MAX_IMPORT_ROWS = MAX_LINES;

export type SheetProblem =
  | { code: "empty" }
  | { code: "missing_columns"; columns: string[] }
  | { code: "too_many_rows"; count: number; max: number };

export type SheetRow = {
  /** Número de fila en el archivo (la primera es la de encabezados). */
  row: number;
  cells: Partial<Record<ImportColumn, string>>;
};

export type ParsedSheet = {
  rows: SheetRow[];
  /** Encabezados que no se reconocieron y se ignoran. */
  ignoredColumns: string[];
  problem?: SheetProblem;
};

const isBlank = (cells: string[]) => cells.every((c) => collapse(c) === "");

/**
 * Convierte la tabla leída del archivo (una lista de filas de texto) en filas
 * con las columnas conocidas. La primera fila no vacía son los encabezados.
 */
export function parseSheet(grid: string[][]): ParsedSheet {
  const headerAt = grid.findIndex((r) => !isBlank(r));
  if (headerAt === -1)
    return { rows: [], ignoredColumns: [], problem: { code: "empty" } };

  const columnAt = new Map<number, ImportColumn>();
  const ignoredColumns: string[] = [];
  grid[headerAt].forEach((text, i) => {
    const header = collapse(text ?? "");
    if (!header) return;
    const key = columnOfHeader(header);
    if (!key || [...columnAt.values()].includes(key))
      ignoredColumns.push(header);
    else columnAt.set(i, key);
  });

  const present = new Set(columnAt.values());
  const missing = IMPORT_COLUMNS.filter(
    (c) => "required" in c && !present.has(c.key),
  ).map((c) => headerOf(c.key));
  if (missing.length > 0) {
    return {
      rows: [],
      ignoredColumns,
      problem: { code: "missing_columns", columns: missing },
    };
  }

  const rows: SheetRow[] = [];
  for (let i = headerAt + 1; i < grid.length; i++) {
    const line = grid[i];
    if (isBlank(line)) continue;
    const cells: SheetRow["cells"] = {};
    for (const [col, key] of columnAt) cells[key] = collapse(line[col] ?? "");
    rows.push({ row: i + 1, cells });
  }

  if (rows.length === 0) {
    return { rows, ignoredColumns, problem: { code: "empty" } };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      ignoredColumns,
      problem: {
        code: "too_many_rows",
        count: rows.length,
        max: MAX_IMPORT_ROWS,
      },
    };
  }
  return { rows, ignoredColumns };
}
