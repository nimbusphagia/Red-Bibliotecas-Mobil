import {
  ENTRY_REASONS,
  EXIT_REASONS,
  MOVEMENT_REASONS,
  MOVEMENT_TYPES,
} from "@/db/schema";
import { createBookSchema } from "@/features/catalog/internal/book/schemas";
import { addDays, parseISODate } from "@/features/shared/format/dates";
import { collapse } from "@/features/shared/format/text";
import { idSchema, listShape } from "@/features/shared/types/schemas";
import type { Assert } from "@/features/shared/types/types";
import { z } from "zod";

export { ENTRY_REASONS, EXIT_REASONS };

export const MAX_COPIES_PER_BOOK = 100;
export const MAX_LINES = 100;
const MAX_EXIT_COPIES = 100;

export type _EntryReasonsAreMovementReasons = Assert<
  (typeof ENTRY_REASONS)[number] extends (typeof MOVEMENT_REASONS)[number]
    ? true
    : false
>;

export type _ExitReasonsAreMovementReasons = Assert<
  (typeof EXIT_REASONS)[number] extends (typeof MOVEMENT_REASONS)[number]
    ? true
    : false
>;
const notes = z
  .string()
  .nullable()
  .transform((v) => (v === null ? null : collapse(v) || null))
  .pipe(z.string().max(500).nullable());

const lineBase = {
  quantity: z.number().int().min(1).max(MAX_COPIES_PER_BOOK),
  shelfId: idSchema.optional(), // overrides the movement's shelf
};

const entryLineSchema = z
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

export const registerCopiesSchema = z.object({
  reason: z.enum(ENTRY_REASONS).default("purchase"),
  ...movementShape,
});

export type RegisterCopiesInput = z.input<typeof registerCopiesSchema>;
export type RegisterCopiesParsed = z.output<typeof registerCopiesSchema>;
export type EntryLineParsed = RegisterCopiesParsed["lines"][number];

export const exitMovementSchema = z.object({
  reason: z.enum(EXIT_REASONS),
  copyIds: z
    .array(idSchema)
    .min(1)
    .max(MAX_EXIT_COPIES)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "The same copy appears more than once",
    }),
  notes: notes.default(null),
});

export type ExitMovementInput = z.input<typeof exitMovementSchema>;
export type ExitMovementParsed = z.output<typeof exitMovementSchema>;

export const MOVEMENT_SORT_KEYS = ["createdAt"] as const;
export type MovementSort = (typeof MOVEMENT_SORT_KEYS)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const { search: _search, ...listFields } = listShape(
  MOVEMENT_SORT_KEYS,
  "createdAt",
  "desc",
);

export const listMovementsSchema = z
  .object({
    type: z.enum(MOVEMENT_TYPES).optional(),
    reason: z.enum(MOVEMENT_REASONS).optional(),
    signedById: idSchema.optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    ...listFields,
  })
  .transform(({ from, to, ...rest }) => ({
    ...rest,
    from: from ? parseISODate(from) : undefined,
    until: to ? parseISODate(addDays(to, 1)) : undefined,
  }));

export const listLinesSchema = z.object({
  movementId: idSchema,
  limit: listFields.limit,
  offset: listFields.offset,
});

export type MovementListParams = z.input<typeof listMovementsSchema>;
export type MovementLinesParams = z.input<typeof listLinesSchema>;
