import { ValidationError } from "@/errors/errors";
import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "@/features/catalog/_shared/service";
import { searchKey } from "@/shared/format/text";
import type { Page } from "@/shared/types/types";
import { parseOrThrow } from "@/shared/validation/validation";
import * as repo from "./repository";
import {
  createVisitorSchema,
  listVisitorsSchema,
  updateVisitorSchema,
  type VisitorListParams,
} from "./schemas";
import type {
  NewVisitor,
  Visitor,
  VisitorListItem,
  VisitorPatch,
  VisitorUsage,
} from "./types";

const ENTITY = "visitor";

export const { get: getVisitor, getUsage: getVisitorUsage } = makeReads<
  Visitor,
  VisitorUsage
>(ENTITY, {
  findById: repo.findVisitorById,
  countUsage: repo.countVisitorUsage,
});

export async function listVisitors(
  params: VisitorListParams = {},
): Promise<Page<VisitorListItem>> {
  return repo.listVisitors(parseOrThrow(listVisitorsSchema, params));
}

export const createVisitor = makeCreate({
  entity: ENTITY,
  schema: createVisitorSchema,
  build: ({ name, role, gradeId }): NewVisitor => ({
    name,
    nameKey: searchKey(name),
    role,
    gradeId,
  }),
  insert: repo.insertVisitor,
});

export const updateVisitor = makeUpdate({
  entity: ENTITY,
  schema: updateVisitorSchema,
  find: repo.findVisitorById,
  update: repo.updateVisitor,
  build: (existing, patch): VisitorPatch => {
    if (patch.gradeId !== undefined && existing.role !== "student") {
      throw new ValidationError([
        { path: "gradeId", message: "Teachers have no grade" },
      ]);
    }
    return {
      ...(patch.name !== undefined && {
        name: patch.name,
        nameKey: searchKey(patch.name),
      }),
      ...(patch.gradeId !== undefined && { gradeId: patch.gradeId }),
      ...(patch.active !== undefined && { active: patch.active }),
    };
  },
});

export const deleteVisitor = makeRemove({
  entity: ENTITY,
  find: repo.findVisitorById,
  countUsage: repo.countVisitorUsage,
  deleteIfUnused: repo.deleteVisitorIfUnused,
});
