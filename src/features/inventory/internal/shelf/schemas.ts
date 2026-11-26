import { nameField } from "@/features/catalog/internal/_shared/fields";
import { collapse } from "@/features/shared/format/text";
import {
  idSchema,
  listShape,
  withTokens,
} from "@/features/shared/types/schemas";
import { z } from "zod";

export const SHELF_SORT_KEYS = ["name", "copyCount", "createdAt"] as const;
export type ShelfSort = (typeof SHELF_SORT_KEYS)[number];

const MAX_MOVE_COPIES = 100;

const description = z
  .string()
  .nullable()
  .transform((v) => (v === null ? null : collapse(v) || null))
  .pipe(z.string().max(200).nullable());

export const createShelfSchema = z.object({
  name: nameField,
  description: description.default(null),
});

export const updateShelfSchema = z
  .object({ name: nameField, description })
  .partial();

export const listShelvesSchema = z
  .object(listShape(SHELF_SORT_KEYS, "name"))
  .transform(withTokens);

export const moveCopiesSchema = z.object({
  shelfId: idSchema,
  copyIds: z
    .array(idSchema)
    .min(1)
    .max(MAX_MOVE_COPIES)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "El mismo ejemplar aparece más de una vez",
    }),
});

export type ShelfInput = z.input<typeof createShelfSchema>;
export type ShelfUpdateInput = z.input<typeof updateShelfSchema>;
export type ShelfListParams = z.input<typeof listShelvesSchema>;
export type MoveCopiesInput = z.input<typeof moveCopiesSchema>;
