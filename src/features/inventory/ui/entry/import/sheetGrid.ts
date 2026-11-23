import type { TemplateData } from "@/features/inventory/internal/entryImport/service";
import { MAX_IMPORT_ROWS } from "@/features/inventory/internal/entryImport/sheet";
import * as XLSX from "xlsx-js-style";

// Los .xlsx empiezan con "PK"; todo lo demás se trata como texto (CSV).
const isZip = (b: Uint8Array) => b[0] === 0x50 && b[1] === 0x4b;

/**
 * Excel en español guarda el «CSV» en Windows-1252, no en UTF-8: si el texto no
 * es UTF-8 válido se lee byte a byte (suficiente para tildes y ñ).
 */
function decodeText(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const text = utf8.includes("�")
    ? Array.from(bytes, (b) => String.fromCharCode(b)).join("")
    : utf8;
  return text.replace(/^﻿/, "");
}

/** Excel en español usa «;» como separador; se elige el más usado. */
function delimiterOf(text: string): string {
  const head = text.split(/\r?\n/, 1)[0] ?? "";
  const count = (c: string) => head.split(c).length - 1;
  return [";", "\t", ","].reduce(
    (best, c) => (count(c) > count(best) ? c : best),
    ",",
  );
}

/** Primera hoja del archivo (.xlsx o .csv) como filas de texto. */
export function gridFromBytes(bytes: Uint8Array): string[][] {
  const book = isZip(bytes)
    ? XLSX.read(bytes, { type: "array" })
    : (() => {
        const text = decodeText(bytes);
        return XLSX.read(text, { type: "string", FS: delimiterOf(text) });
      })();
  const sheet = book.Sheets[book.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils
    .sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "" })
    .map((row) => row.map((cell) => String(cell ?? "")));
}

// Colores en ARGB (8 dígitos): Excel no siempre acepta los de 6 en las fuentes.
const LINE = { style: "thin", color: { rgb: "FFD0D5DD" } };
const BORDERS = { top: LINE, bottom: LINE, left: LINE, right: LINE };

const headerStyle = (required: boolean) => ({
  font: { bold: true, color: { rgb: required ? "FFFFFFFF" : "FF334155" } },
  fill: {
    patternType: "solid",
    fgColor: { rgb: required ? "FF334155" : "FFF1F5F9" },
  },
  border: BORDERS,
  alignment: { vertical: "center", horizontal: "center", wrapText: true },
});
const bodyStyle = { border: BORDERS, alignment: { vertical: "center" } };

type Cell = { v: string; s: object; z?: string };

/** Hoja con celdas de texto, todas con borde (también las vacías). */
function sheetOf(
  rows: Cell[][],
  widths: number[],
  headerRows: number[] = [0],
): XLSX.WorkSheet {
  const sheet: XLSX.WorkSheet = {};
  rows.forEach((row, r) =>
    row.forEach((cell, c) => {
      sheet[XLSX.utils.encode_cell({ r, c })] = { t: "s", ...cell };
    }),
  );
  sheet["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rows.length - 1, c: Math.max(...rows.map((r) => r.length)) - 1 },
  });
  sheet["!cols"] = widths.map((wch) => ({ wch }));
  sheet["!rows"] = rows.map((_, r) =>
    headerRows.includes(r) ? { hpt: 24 } : { hpt: 18 },
  );
  return sheet;
}

const body = (v = "", z?: string): Cell => ({ v, s: bodyStyle, z });
const widthOf = (header: string, example: string) =>
  Math.min(36, Math.max(14, header.length + 4, example.length + 2));

/**
 * Plantilla .xlsx. «Libros» solo lleva los encabezados (para no registrar un
 * libro de ejemplo por descuido) y filas vacías con borde; el ejemplo y los
 * valores válidos van en otras hojas. Las columnas de código son texto para
 * que Excel no convierta «001» en 1.
 */
export function templateBytes(t: TemplateData): Uint8Array {
  const headers: Cell[] = t.headers.map((h, i) => ({
    v: t.required[i] ? `${h} *` : h,
    s: headerStyle(t.required[i]),
  }));
  const widths = t.headers.map((h, i) => widthOf(h, t.example[i]));

  const empty = Array.from({ length: MAX_IMPORT_ROWS }, () =>
    t.headers.map((_, i) => body("", t.text[i] ? "@" : undefined)),
  );
  const example = t.example.map((v, i) => body(v, t.text[i] ? "@" : undefined));

  const help = (title: string, items: string[][]): Cell[][] => [
    [
      { v: title, s: headerStyle(true) },
      { v: "Nombre", s: headerStyle(false) },
    ],
    ...items.map(([a, b]) => [body(a, "@"), body(b)]),
  ];
  const tables = [
    help(
      "Categoría",
      t.categories.map((c) => [c.code, c.name]),
    ),
    help(
      "Subcategoría",
      t.subcategories.map((c) => [c.code, c.name]),
    ),
    help(
      "Estante",
      t.shelves.map((s) => [s, ""]),
    ).map((r) => r.slice(0, 1)),
  ];
  const height = Math.max(...tables.map((x) => x.length));
  const helpRows: Cell[][] = Array.from({ length: height }, (_, r) => {
    const gap = { v: "", s: {} };
    return [
      ...(tables[0][r] ?? [body(), body()].map(() => ({ v: "", s: {} }))),
      gap,
      ...(tables[1][r] ?? [
        { v: "", s: {} },
        { v: "", s: {} },
      ]),
      gap,
      ...(tables[2][r] ?? [{ v: "", s: {} }]),
    ];
  });

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    sheetOf([headers, ...empty], widths),
    "Libros",
  );
  XLSX.utils.book_append_sheet(
    book,
    sheetOf([headers, example], widths),
    "Ejemplo",
  );
  XLSX.utils.book_append_sheet(
    book,
    sheetOf(helpRows, [14, 30, 3, 16, 30, 3, 24]),
    "Ayuda",
  );
  return new Uint8Array(XLSX.write(book, { type: "array", bookType: "xlsx" }));
}
