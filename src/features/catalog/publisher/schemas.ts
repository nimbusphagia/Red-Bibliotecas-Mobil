import { listShape, withTokens } from "@/shared/types/schemas";
import type { Assert } from "@/shared/types/types";
import { z } from "zod";
import { nameField } from "../_shared/fields";
import type { PublisherListFilters } from "./types";

export const PUBLISHER_SORT_KEYS = ["name", "createdAt", "bookCount"] as const;
export type PublisherSort = (typeof PUBLISHER_SORT_KEYS)[number];

export const createPublisherSchema = z.object({ name: nameField });
export const updatePublisherSchema = createPublisherSchema.partial();

export const listPublishersSchema = z
  .object({
    ...listShape(PUBLISHER_SORT_KEYS, "name"),
    withBooks: z.boolean().optional(),
  })
  .transform(withTokens);

export type PublisherInput = z.input<typeof createPublisherSchema>;
export type PublisherUpdateInput = z.input<typeof updatePublisherSchema>;
export type PublisherListParams = z.input<typeof listPublishersSchema>;

export type _PublisherListMatchesRepo = Assert<
  z.output<typeof listPublishersSchema> extends PublisherListFilters
    ? true
    : false
>;
