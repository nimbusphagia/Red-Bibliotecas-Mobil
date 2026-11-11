import { idSchema, listShape, withTokens } from "@/shared/types/schemas";
import type { Assert } from "@/shared/types/types";
import { z } from "zod";
import { nameField } from "../_shared/fields";
import type { SeriesListFilters } from "./types";

export const SERIES_SORT_KEYS = ["name", "createdAt", "bookCount"] as const;
export type SeriesSort = (typeof SERIES_SORT_KEYS)[number];

export const createSeriesSchema = z.object({
  name: nameField,
  authorId: idSchema,
});

export const updateSeriesSchema = z
  .object({ name: nameField, authorId: idSchema })
  .partial();

export const listSeriesSchema = z
  .object({
    ...listShape(SERIES_SORT_KEYS, "name"),
    authorId: idSchema.optional(),
    withBooks: z.boolean().optional(),
  })
  .transform(withTokens);

export type SeriesInput = z.input<typeof createSeriesSchema>;
export type SeriesUpdateInput = z.input<typeof updateSeriesSchema>;
export type SeriesListParams = z.input<typeof listSeriesSchema>;

export type _SeriesListMatchesRepo = Assert<
  z.output<typeof listSeriesSchema> extends SeriesListFilters ? true : false
>;
