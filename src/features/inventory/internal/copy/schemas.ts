import { COPY_STATUSES } from "@/db/schema";
import { idSchema, listShape } from "@/features/shared/types/schemas";
import { z } from "zod";

export const COPY_SORT_KEYS = ["copyNumber", "status", "createdAt"] as const;
export type CopySort = (typeof COPY_SORT_KEYS)[number];

const { search: _search, ...listFields } = listShape(
  COPY_SORT_KEYS,
  "copyNumber",
);

export const listCopiesSchema = z.object({
  bookId: idSchema,
  status: z.enum(COPY_STATUSES).optional(),
  shelfId: idSchema.optional(),
  ...listFields,
});

export type CopyListParams = z.input<typeof listCopiesSchema>;
