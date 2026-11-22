import { MM_TO_PT, type SheetConfig } from "./config";

export type Grid = {
  columns: number;
  rows: number;
  perPage: number;
  /** Todo en puntos. */
  pageWidth: number;
  pageHeight: number;
  originX: number;
  originY: number;
  pairWidth: number;
  idWidth: number;
  labelWidth: number;
  labelHeight: number;
  stepX: number;
  stepY: number;
};

export type Slot = {
  page: number;
  /** Esquina superior izquierda del par, en puntos desde el borde izquierdo. */
  x: number;
  /** Distancia desde el borde superior de la página, en puntos. */
  yTop: number;
};

const pt = (mm: number) => mm * MM_TO_PT;

export function computeGrid(c: SheetConfig): Grid {
  const pairWidth = c.idWidth + c.labelWidth;
  const usableW = c.pageWidth - 2 * c.margin;
  const usableH = c.pageHeight - 2 * c.margin - c.footerHeight;
  const columns = Math.floor((usableW + c.gapX) / (pairWidth + c.gapX));
  const rows = Math.floor((usableH + c.gapY) / (c.labelHeight + c.gapY));
  if (columns < 1 || rows < 1) {
    throw new Error("The label size does not fit on the page");
  }
  const gridW = columns * pairWidth + (columns - 1) * c.gapX;
  return {
    columns,
    rows,
    perPage: columns * rows,
    pageWidth: pt(c.pageWidth),
    pageHeight: pt(c.pageHeight),
    originX: pt(c.margin + (usableW - gridW) / 2),
    originY: pt(c.margin),
    pairWidth: pt(pairWidth),
    idWidth: pt(c.idWidth),
    labelWidth: pt(c.labelWidth),
    labelHeight: pt(c.labelHeight),
    stepX: pt(pairWidth + c.gapX),
    stepY: pt(c.labelHeight + c.gapY),
  };
}

/** Posición del n-ésimo par, llenando de izquierda a derecha y de arriba abajo. */
export function slotAt(index: number, g: Grid): Slot {
  const page = Math.floor(index / g.perPage);
  const inPage = index % g.perPage;
  return {
    page,
    x: g.originX + (inPage % g.columns) * g.stepX,
    yTop: g.originY + Math.floor(inPage / g.columns) * g.stepY,
  };
}
