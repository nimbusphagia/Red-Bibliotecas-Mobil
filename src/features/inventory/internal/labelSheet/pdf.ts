import { formatDate } from "@/features/shared/format/dates";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  grayscale,
} from "pdf-lib";
import { DEFAULT_SHEET, type SheetConfig } from "./config";
import { computeGrid, slotAt, type Grid } from "./layout";

export type SheetLabel = { copyId: number; text: string };

const MAX_FONT = 14;
const MAX_ID_FONT = 9;
const PADDING = 3;
const LINE_HEIGHT = 1.25;
const BORDER = 0.6;

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** `863-GAR-N-CIE-3` => una línea por código, sin guiones. */
const linesOf = (text: string) => text.split("-").filter(Boolean);

/**
 * Hoja A4 con un par por ejemplar: celda con el #id y, al lado, el rectángulo
 * vertical con el tejuelo (un código por línea). Cada celda lleva borde para
 * recortarla, y el pie lleva la fecha de impresión para distinguir copias
 * impresas de días distintos.
 */
export async function buildLabelSheet(
  labels: SheetLabel[],
  printedAt: Date,
  config: SheetConfig = DEFAULT_SHEET,
): Promise<Uint8Array> {
  if (labels.length === 0) throw new Error("No labels to print");

  const grid = computeGrid(config);
  const doc = await PDFDocument.create();
  doc.setTitle("Tejuelos");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Mismo tamaño de letra en toda la hoja: el que le cabe a la etiqueta más exigente.
  const fontSize = labelFontSize(labels, grid, bold);

  const pageCount = Math.ceil(labels.length / grid.perPage);
  const pages: PDFPage[] = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push(doc.addPage([grid.pageWidth, grid.pageHeight]));
  }

  labels.forEach((label, index) => {
    const slot = slotAt(index, grid);
    drawPair(pages[slot.page], grid, slot.x, slot.yTop, label, {
      regular,
      bold,
      fontSize,
    });
  });

  pages.forEach((page, i) => {
    const text = `Impreso el ${stamp(printedAt)}  ·  ${labels.length} etiquetas  ·  Página ${i + 1} de ${pageCount}`;
    const size = 8;
    page.drawText(text, {
      x: grid.originX,
      y: grid.originY * 0.7,
      size,
      font: regular,
      color: grayscale(0.35),
    });
  });

  return doc.save();
}

function labelFontSize(labels: SheetLabel[], g: Grid, font: PDFFont): number {
  let size = MAX_FONT;
  for (const { text } of labels) {
    const lines = linesOf(text);
    const widest = Math.max(...lines.map((l) => font.widthOfTextAtSize(l, 1)));
    size = Math.min(
      size,
      (g.labelWidth - 2 * PADDING) / widest,
      (g.labelHeight - 2 * PADDING) / (lines.length * LINE_HEIGHT),
    );
  }
  return size;
}

function drawPair(
  page: PDFPage,
  g: Grid,
  x: number,
  yTop: number,
  label: SheetLabel,
  f: { regular: PDFFont; bold: PDFFont; fontSize: number },
) {
  const bottom = g.pageHeight - yTop - g.labelHeight;
  const border = { borderColor: grayscale(0), borderWidth: BORDER };

  // Celda del id.
  page.drawRectangle({ x, y: bottom, width: g.idWidth, height: g.labelHeight, ...border });
  const idText = `#${label.copyId}`;
  const idSize = Math.min(
    MAX_ID_FONT,
    (g.idWidth - 2 * PADDING) / f.regular.widthOfTextAtSize(idText, 1),
  );
  page.drawText(idText, {
    x: x + (g.idWidth - f.regular.widthOfTextAtSize(idText, idSize)) / 2,
    y: bottom + g.labelHeight / 2 - idSize * 0.35,
    size: idSize,
    font: f.regular,
  });

  // Tejuelo: rectángulo vertical, un código por línea, centrado.
  const lx = x + g.idWidth;
  page.drawRectangle({ x: lx, y: bottom, width: g.labelWidth, height: g.labelHeight, ...border });
  const lines = linesOf(label.text);
  const lineH = f.fontSize * LINE_HEIGHT;
  const blockTop = bottom + (g.labelHeight + lines.length * lineH) / 2;
  lines.forEach((line, i) => {
    const w = f.bold.widthOfTextAtSize(line, f.fontSize);
    page.drawText(line, {
      x: lx + (g.labelWidth - w) / 2,
      y: blockTop - (i + 1) * lineH + (lineH - f.fontSize) / 2 + f.fontSize * 0.1,
      size: f.fontSize,
      font: f.bold,
    });
  });
}
