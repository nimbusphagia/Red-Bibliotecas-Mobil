import {
  idSchema,
  listShape,
  withTokens,
} from "@/features/shared/types/schemas";
import type { Assert } from "@/features/shared/types/types";
import { z } from "zod";
import { nameField } from "../_shared/fields";
import type { CollectionListFilters } from "./types";

export const COLLECTION_SORT_KEYS = ["name", "createdAt", "bookCount"] as const;
export type CollectionSort = (typeof COLLECTION_SORT_KEYS)[number];

export const createCollectionSchema = z.object({
  name: nameField,
  publisherId: idSchema,
});

export const updateCollectionSchema = z
  .strictObject({ name: nameField })
  .partial();

export const listCollectionsSchema = z
  .object({
    ...listShape(COLLECTION_SORT_KEYS, "name"),
    publisherId: idSchema.optional(),
    withBooks: z.boolean().optional(),
  })
  .transform(withTokens);

export type CollectionInput = z.input<typeof createCollectionSchema>;
export type CollectionUpdateInput = z.input<typeof updateCollectionSchema>;
export type CollectionListParams = z.input<typeof listCollectionsSchema>;

export type _CollectionListMatchesRepo = Assert<
  z.output<typeof listCollectionsSchema> extends CollectionListFilters
    ? true
    : false
>;
