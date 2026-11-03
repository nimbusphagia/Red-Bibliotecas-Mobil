import { z } from "zod";
import { COLLABORATOR_ROLES } from "@/db/schema";
import {
  AUTHOR_SORT_KEYS,
  type AuthorListFilters,
  type NewAuthor,
} from "./types";

// Helpers
const collapse = (s: string) => s.trim().replace(/\s+/g, " ");
const clamp = (min: number, max: number) => (n: number) =>
  Math.min(Math.max(n, min), max);

const NAME_MAX = 100;
export const LIST_LIMIT_DEFAULT = 50;
export const LIST_LIMIT_MAX = 100;

// Fields
const firstName = z
  .string()
  .transform(collapse)
  .pipe(z.string().min(1, "Required").max(NAME_MAX));

const lastName = z
  .string()
  .nullable()
  .transform((v) => (v === null ? null : collapse(v) || null))
  .pipe(z.string().max(NAME_MAX).nullable());

// Requests
export const createAuthorSchema = z.object({
  firstName,
  lastName: lastName.default(null),
});

export const updateAuthorSchema = z.object({ firstName, lastName }).partial();

export const listAuthorsSchema = z
  .object({
    search: z.string().default(""),
    role: z.enum(COLLABORATOR_ROLES).optional(),
    withBooks: z.boolean().optional(),
    sortBy: z.enum(AUTHOR_SORT_KEYS).default("name"),
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
export type AuthorInput = z.input<typeof createAuthorSchema>;
export type AuthorUpdateInput = z.input<typeof updateAuthorSchema>;
export type AuthorListParams = z.input<typeof listAuthorsSchema>;

// Guards
type Assert<T extends true> = T;
export type _CreateMatchesRepo = Assert<
  z.output<typeof createAuthorSchema> extends NewAuthor ? true : false
>;
export type _ListMatchesRepo = Assert<
  z.output<typeof listAuthorsSchema> extends AuthorListFilters ? true : false
>;
