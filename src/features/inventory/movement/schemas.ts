import { MOVEMENT_REASONS } from "@/db/schema";
import { createBookSchema } from "@/features/catalog/book/schemas";
import { collapse } from "@/shared/format/text";
import { idSchema } from "@/shared/types/schemas";
import type { Assert } from "@/shared/types/types";
import { z } from "zod";

export const MAX_COPIES_PER_BOOK = 100;
export const MAX_LINES = 50;
export const MAX_OMIT_WORDS = 10;

export const ENTRY_REASONS = ["purchase", "donation", "other"] as const;
export type _EntryReasonsAreMovementReasons = Assert<
  (typeof ENTRY_REASONS)[number] extends (typeof MOVEMENT_REASONS)[number]
    ? true
    : false
>;

const notes = z
  .string()
  .nullable()
  .transform((v) => (v === null ? null : collapse(v) || null))
  .pipe(z.string().max(500).nullable());

const omitWord = z.string().transform(collapse).pipe(z.string().min(1).max(40));

const lineBase = {
  quantity: z.number().int().min(1).max(MAX_COPIES_PER_BOOK),
  shelfId: idSchema.optional(), // overrides the movement's shelf
  omitWords: z.array(omitWord).max(MAX_OMIT_WORDS).default([]),
};

export const entryLineSchema = z
  .strictObject({
    bookId: idSchema.optional(),
    book: createBookSchema.optional(),
    ...lineBase,
  })
  .refine((l) => (l.bookId === undefined) !== (l.book === undefined), {
    message: "Provide either bookId or book, not both",
  })
  .transform(({ bookId, book, ...rest }) =>
    bookId !== undefined
      ? { kind: "existing" as const, bookId, ...rest }
      : { kind: "new" as const, book: book!, ...rest },
  );

const linesSchema = z
  .array(entryLineSchema)
  .min(1)
  .max(MAX_LINES)
  .refine(
    (lines) => {
      const ids = lines.flatMap((l) =>
        l.kind === "existing" ? [l.bookId] : [],
      );
      return new Set(ids).size === ids.length;
    },
    { message: "The same book appears in more than one line" },
  );

const movementShape = {
  shelfId: idSchema.optional(),
  notes: notes.default(null),
  lines: linesSchema,
};

export const entryMovementSchema = z.object({
  reason: z.enum(ENTRY_REASONS),
  ...movementShape,
});

export const registerCopiesSchema = z.object({
  reason: z.enum(ENTRY_REASONS).default("purchase"),
  ...movementShape,
});

export type EntryMovementInput = z.input<typeof entryMovementSchema>;
export type RegisterCopiesInput = z.input<typeof registerCopiesSchema>;
export type EntryMovementParsed = z.output<typeof entryMovementSchema>;
export type EntryLineParsed = EntryMovementParsed["lines"][number];
