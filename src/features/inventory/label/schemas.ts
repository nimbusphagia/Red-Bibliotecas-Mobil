import { PRINT_STATUSES } from "@/db/schema";
import { idSchema, listShape, withTokens } from "@/shared/types/schemas";
import { z } from "zod";

export const LABEL_SORT_KEYS = ["createdAt", "text"] as const;
export type LabelSort = (typeof LABEL_SORT_KEYS)[number];

export const MAX_PRINT_LABELS = 500;

export const listLabelsSchema = z
  .object({
    ...listShape(LABEL_SORT_KEYS, "createdAt", "desc"),
    printStatus: z.enum(PRINT_STATUSES).optional(),
    bookId: idSchema.optional(),
    includeRevoked: z.boolean().default(false),
  })
  .transform(withTokens);

export const markPrintedSchema = z.object({
  labelIds: z
    .array(idSchema)
    .min(1)
    .max(MAX_PRINT_LABELS)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "The same label appears more than once",
    }),
});

export type LabelListParams = z.input<typeof listLabelsSchema>;
export type MarkPrintedInput = z.input<typeof markPrintedSchema>;
