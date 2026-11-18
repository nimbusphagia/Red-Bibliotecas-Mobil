import { LINE_OUTCOMES } from "@/db/schema";
import { addDays, parseISODate } from "@/features/shared/format/dates";
import { collapse } from "@/features/shared/format/text";
import {
  idSchema,
  listShape,
  withTokens,
} from "@/features/shared/types/schemas";
import { z } from "zod";
import { MAX_OPEN_COPIES } from "./rules";

export const LOAN_SORT_KEYS = ["createdAt", "expiresBy", "visitor"] as const;
export type LoanSort = (typeof LOAN_SORT_KEYS)[number];

export const OPEN_LINE_SORT_KEYS = ["expiresBy", "visitor", "title"] as const;
export type OpenLineSort = (typeof OPEN_LINE_SORT_KEYS)[number];

export const MAX_RETURN_ITEMS = 50;

export const LINE_STATUSES = ["pending", ...LINE_OUTCOMES] as const;
export type LineStatus = (typeof LINE_STATUSES)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const unique = (ids: number[]) => new Set(ids).size === ids.length;

const notes = z
  .string()
  .nullable()
  .transform((v) => (v === null ? null : collapse(v) || null))
  .pipe(z.string().max(500).nullable())
  .default(null);

export const lendSchema = z.object({
  visitorId: idSchema,
  copyIds: z
    .array(idSchema)
    .min(1)
    .max(MAX_OPEN_COPIES)
    .refine(unique, { message: "The same copy appears more than once" }),
  notes,
});

export const returnSchema = z.object({
  items: z
    .array(
      z.object({
        copyId: idSchema,
        outcome: z.enum(LINE_OUTCOMES).default("returned"),
        reason: z.enum(["loss", "discard"]).optional(),
      }),
    )
    .min(1)
    .max(MAX_RETURN_ITEMS)
    .refine((items) => unique(items.map((i) => i.copyId)), {
      message: "The same copy appears more than once",
    }),
});

export const listLoansSchema = z
  .object({
    ...listShape(LOAN_SORT_KEYS, "createdAt", "desc"),
    visitorId: idSchema.optional(),
    state: z.enum(["open", "closed", "overdue"]).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .transform(withTokens)
  .transform(({ from, to, ...rest }) => ({
    ...rest,
    from: from ? parseISODate(from) : undefined,
    until: to ? parseISODate(addDays(to, 1)) : undefined,
  }));

export const listOpenLinesSchema = z
  .object({
    ...listShape(OPEN_LINE_SORT_KEYS, "expiresBy"),
    visitorId: idSchema.optional(),
    overdue: z.boolean().optional(),
  })
  .transform(withTokens);

export const listLinesSchema = z.object({
  loanId: idSchema,
  limit: listShape(LOAN_SORT_KEYS, "createdAt").limit,
  offset: listShape(LOAN_SORT_KEYS, "createdAt").offset,
});

const visitorLinePage = listShape(["createdAt"], "createdAt", "desc");

export const listVisitorLinesSchema = z.object({
  visitorId: idSchema,
  status: z.enum(LINE_STATUSES).optional(),
  sortDir: visitorLinePage.sortDir,
  limit: visitorLinePage.limit,
  offset: visitorLinePage.offset,
});

export type LendInput = z.input<typeof lendSchema>;
export type ReturnInput = z.input<typeof returnSchema>;
export type LoanListParams = z.input<typeof listLoansSchema>;
export type OpenLinesParams = z.input<typeof listOpenLinesSchema>;
export type LoanLinesParams = z.input<typeof listLinesSchema>;
export type VisitorLinesParams = z.input<typeof listVisitorLinesSchema>;
