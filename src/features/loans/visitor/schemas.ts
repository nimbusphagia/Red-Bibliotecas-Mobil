import { VISITOR_ROLES } from "@/db/schema";
import { nameField } from "@/features/catalog/_shared/fields";
import { idSchema, listShape, withTokens } from "@/shared/types/schemas";
import type { Assert } from "@/shared/types/types";
import { z } from "zod";
import type { VisitorListFilters } from "./types";

export const VISITOR_SORT_KEYS = ["name", "createdAt"] as const;
export type VisitorSort = (typeof VISITOR_SORT_KEYS)[number];

export const createVisitorSchema = z
  .object({
    name: nameField,
    role: z.enum(VISITOR_ROLES),
    gradeId: idSchema.nullable().default(null),
  })
  .refine((v) => v.role !== "student" || v.gradeId !== null, {
    path: ["gradeId"],
    message: "Required for students",
  })
  .refine((v) => v.role !== "teacher" || v.gradeId === null, {
    path: ["gradeId"],
    message: "Teachers have no grade",
  });

export const updateVisitorSchema = z
  .object({ name: nameField, gradeId: idSchema, active: z.boolean() })
  .partial();

export const listVisitorsSchema = z
  .object({
    ...listShape(VISITOR_SORT_KEYS, "name"),
    role: z.enum(VISITOR_ROLES).optional(),
    gradeId: idSchema.optional(),
    active: z.boolean().optional(),
  })
  .transform(withTokens);

export type VisitorInput = z.input<typeof createVisitorSchema>;
export type VisitorUpdateInput = z.input<typeof updateVisitorSchema>;
export type VisitorListParams = z.input<typeof listVisitorsSchema>;

export type _VisitorListMatchesRepo = Assert<
  z.output<typeof listVisitorsSchema> extends VisitorListFilters ? true : false
>;
