import { COLLABORATOR_ROLES } from "@/db/schema";
import {
  idSchema,
  listShape,
  withTokens,
} from "@/features/shared/types/schemas";
import type { Assert } from "@/features/shared/types/types";
import { z } from "zod";
import { nameField } from "../_shared/fields";
import type { BookListFilters } from "./types";

export const BOOK_SORT_KEYS = ["title", "createdAt", "availableCount"] as const;
export type BookSort = (typeof BOOK_SORT_KEYS)[number];

const collaboratorSchema = z.object({
  authorId: idSchema,
  role: z.enum(COLLABORATOR_ROLES),
});

const collaboratorsSchema = z
  .array(collaboratorSchema)
  .refine((list) => list.some((c) => c.role === "writer"), {
    message: "At least one writer is required",
  })
  .refine(
    (list) =>
      new Set(list.map((c) => `${c.authorId}:${c.role}`)).size === list.length,
    { message: "Duplicate collaborator" },
  );

const fkId = idSchema.nullable();

const fields = {
  title: nameField,
  publisherId: fkId,
  collectionId: fkId,
  seriesId: fkId,
  categoryId: fkId,
  subcategoryId: fkId,
  publicationYear: z.number().int().nullable(),
  pageCount: z.number().int().positive().nullable(),
  collaborators: collaboratorsSchema,
};

const collectionNeedsPublisher = {
  check: (b: { publisherId?: number | null; collectionId?: number | null }) =>
    !(typeof b.collectionId === "number" && b.publisherId === null),
  options: {
    message: "A collection requires a publisher",
    path: ["collectionId"],
  },
};

export const createBookSchema = z
  .object({
    ...fields,
    publisherId: fields.publisherId.default(null),
    collectionId: fields.collectionId.default(null),
    seriesId: fields.seriesId.default(null),
    categoryId: fields.categoryId.default(null),
    subcategoryId: fields.subcategoryId.default(null),
    publicationYear: fields.publicationYear.default(null),
    pageCount: fields.pageCount.default(null),
  })
  .refine(collectionNeedsPublisher.check, collectionNeedsPublisher.options);

export const updateBookSchema = z
  .object(fields)
  .partial()
  .refine(collectionNeedsPublisher.check, collectionNeedsPublisher.options);

export const listBooksSchema = z
  .object({
    ...listShape(BOOK_SORT_KEYS, "title"),
    authorId: idSchema.optional(),
    role: z.enum(COLLABORATOR_ROLES).optional(),
    publisherId: idSchema.optional(),
    collectionId: idSchema.optional(),
    seriesId: idSchema.optional(),
    categoryId: idSchema.optional(),
    subcategoryId: idSchema.optional(),
    active: z.boolean().optional(),
  })
  .transform(withTokens);

export type BookInput = z.input<typeof createBookSchema>;
export type BookUpdateInput = z.input<typeof updateBookSchema>;
export type BookListParams = z.input<typeof listBooksSchema>;

export type _BookListMatchesRepo = Assert<
  z.output<typeof listBooksSchema> extends BookListFilters ? true : false
>;
