/** Medidas de la hoja de tejuelos, en milímetros. */
export type SheetConfig = {
  pageWidth: number;
  pageHeight: number;
  /** Margen en los cuatro lados. */
  margin: number;
  /** Alto reservado abajo para el pie con la fecha de impresión. */
  footerHeight: number;
  /** Celda con el #id del ejemplar, a la izquierda del tejuelo. */
  idWidth: number;
  /** Rectángulo vertical del tejuelo. */
  labelWidth: number;
  labelHeight: number;
  /** Espacio entre pares (columnas) y entre filas, para recortar. */
  gapX: number;
  gapY: number;
};

/** A4 vertical. Predeterminado: 24 etiquetas por hoja (4 columnas × 6 filas). */
export const DEFAULT_SHEET: SheetConfig = {
  pageWidth: 210,
  pageHeight: 297,
  margin: 10,
  footerHeight: 12,
  idWidth: 15,
  labelWidth: 25,
  labelHeight: 40,
  gapX: 4,
  gapY: 4,
};

export const MM_TO_PT = 72 / 25.4;
