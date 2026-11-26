import { z } from "zod";

export const CATALOG_APP = "biblioteca-catalogo";
export const CATALOG_FORMAT = 1;

const rows = z.array(
  z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
);

export const catalogFileSchema = z.object({
  app: z.literal(CATALOG_APP),
  format: z.literal(CATALOG_FORMAT),
  migration: z.string(),
  exportedAt: z.iso.datetime(),
  tables: z.object({
    author: rows,
    publisher: rows,
    collection: rows,
    series: rows,
    category: rows,
    subcategory: rows,
    book: rows,
    book_collaborator: rows,
    shelf: rows,
    copy: rows,
  }),
});
