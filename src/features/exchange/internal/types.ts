import type { z } from "zod";
import type { TABLES } from "./repository";
import type { catalogFileSchema } from "./schemas";

export type TableName = keyof typeof TABLES;

export type Row = Record<string, string | number | null>;

export type CatalogFile = z.infer<typeof catalogFileSchema>;

export type CatalogSummary = {
  exportedAt: string;
  books: number;
  copies: number;
  shelves: number;
};
