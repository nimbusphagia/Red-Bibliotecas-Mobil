import { z } from "zod";
import { listShape, withTokens } from "@/shared/schemas";
import type { ListFilters } from "@/shared/types";

export const REFERENCE_SORT_KEYS = ["name", "code", "bookCount"] as const;
export type ReferenceSort = (typeof REFERENCE_SORT_KEYS)[number];

export const listReferenceSchema = z
  .object({
    ...listShape(REFERENCE_SORT_KEYS, "name"),
    withBooks: z.boolean().optional(),
  })
  .transform(withTokens);

export type ReferenceListParams = z.input<typeof listReferenceSchema>;
export type ReferenceListFilters = ListFilters<ReferenceSort> & {
  withBooks?: boolean;
};
export type ReferenceUsage = { books: number };
