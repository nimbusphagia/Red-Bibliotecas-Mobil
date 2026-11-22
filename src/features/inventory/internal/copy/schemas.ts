import { COPY_STATUSES } from "@/db/schema";
import {
  idSchema,
  listShape,
  withTokens,
} from "@/features/shared/types/schemas";
import { z } from "zod";

export const COPY_SORT_KEYS = [
  "copyNumber",
  "status",
  "createdAt",
  "labeledAt",
] as const;
export type CopySort = (typeof COPY_SORT_KEYS)[number];

export const MAX_LABEL_COPIES = 500;

export const listCopiesSchema = z
  .object({
    ...listShape(COPY_SORT_KEYS, "copyNumber"),
    bookId: idSchema.optional(),
    status: z.enum(COPY_STATUSES).optional(),
    shelfId: idSchema.optional(),
    labeled: z.boolean().optional(),
    outdated: z.boolean().optional(),
    excludeReleased: z.boolean().optional(),
  })
  .transform(withTokens);

export const labelCopiesSchema = z.object({
  copyIds: z
    .array(idSchema)
    .min(1)
    .max(MAX_LABEL_COPIES)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "The same copy appears more than once",
    }),
});

export type CopyListParams = z.input<typeof listCopiesSchema>;
export type LabelCopiesInput = z.input<typeof labelCopiesSchema>;
