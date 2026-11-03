import { z } from "zod";
import {
  PUBLISHER_SORT_KEYS,
  type PublisherListFilters,
  type NewPublisher,
} from "./types";

// Helpers
const collapse = (s: string) => s.trim().replace(/\s+/g, " ");
const clamp = (min: number, max: number) => (n: number) =>
  Math.min(Math.max(n, min), max);

const NAME_MAX = 100;
export const LIST_LIMIT_DEFAULT = 50;
export const LIST_LIMIT_MAX = 100;

// Fields
const name = z
  .string()
  .transform(collapse)
  .pipe(z.string().min(1, "Required").max(NAME_MAX));

// Requests
export const createPublisherSchema = z.object({
  name,
});

export const updatePublisherSchema = z.object({ name }).partial();

export const listPublishersSchema = z
  .object({
    search: z.string().default(""),
    withBooks: z.boolean().optional(),
    sortBy: z.enum(PUBLISHER_SORT_KEYS).default("name"),
    sortDir: z.enum(["asc", "desc"]).default("asc"),
    limit: z.coerce
      .number()
      .int()
      .default(LIST_LIMIT_DEFAULT)
      .transform(clamp(1, LIST_LIMIT_MAX)),
    offset: z.coerce
      .number()
      .int()
      .default(0)
      .transform(clamp(0, Number.MAX_SAFE_INTEGER)),
  })
  .transform(({ search, ...rest }) => ({
    ...rest,
    tokens: collapse(search).split(" ").filter(Boolean),
  }));

// Public types
export type PublisherInput = z.input<typeof createPublisherSchema>;
export type PublisherUpdateInput = z.input<typeof updatePublisherSchema>;
export type PublisherListParams = z.input<typeof listPublishersSchema>;

// Guards
type Assert<T extends true> = T;
export type _CreateMatchesRepo = Assert<
  z.output<typeof createPublisherSchema> extends NewPublisher ? true : false
>;
export type _ListMatchesRepo = Assert<
  z.output<typeof listPublishersSchema> extends PublisherListFilters
    ? true
    : false
>;
