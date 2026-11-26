import { COLLABORATOR_ROLES } from "@/db/schema";
import { collapse } from "@/features/shared/format/text";
import { listShape, withTokens } from "@/features/shared/types/schemas";
import type { Assert } from "@/features/shared/types/types";
import { z } from "zod";
import { NAME_MAX, nameField } from "../_shared/fields";
import type { AuthorListFilters } from "./types";

export const AUTHOR_SORT_KEYS = ["name", "createdAt", "bookCount"] as const;
export type AuthorSort = (typeof AUTHOR_SORT_KEYS)[number];

const lastName = z
  .string()
  .nullable()
  .transform((v) => (v === null ? null : collapse(v) || null))
  .pipe(z.string().max(NAME_MAX, `Máximo ${NAME_MAX} caracteres`).nullable());

export const createAuthorSchema = z.object({
  firstName: nameField,
  lastName: lastName.default(null),
});

export const updateAuthorSchema = z
  .object({ firstName: nameField, lastName })
  .partial();

export const listAuthorsSchema = z
  .object({
    ...listShape(AUTHOR_SORT_KEYS, "name"),
    role: z.enum(COLLABORATOR_ROLES).optional(),
    withBooks: z.boolean().optional(),
  })
  .transform(withTokens);

export type AuthorInput = z.input<typeof createAuthorSchema>;
export type AuthorUpdateInput = z.input<typeof updateAuthorSchema>;
export type AuthorListParams = z.input<typeof listAuthorsSchema>;

export type _AuthorListMatchesRepo = Assert<
  z.output<typeof listAuthorsSchema> extends AuthorListFilters ? true : false
>;
