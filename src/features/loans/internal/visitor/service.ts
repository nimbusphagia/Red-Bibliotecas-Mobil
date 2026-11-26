import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "@/features/catalog/internal/_shared/service";
import { searchKey } from "@/features/shared/format/text";
import {
  NotFoundError,
  ValidationError,
} from "@/features/shared/errors/errors";
import { idSchema } from "@/features/shared/types/schemas";
import type { Page } from "@/features/shared/types/types";
import { parseOrThrow } from "@/features/shared/validation/validation";
import * as repo from "./repository";
import { reputationOf, type LineHistory } from "./reputation";
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
  VisitorRow,
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

const withReputation = (row: VisitorRow): VisitorListItem => ({
  ...row,
  reputation: reputationOf(row.history),
});

export async function listVisitors(
  params: VisitorListParams = {},
): Promise<Page<VisitorListItem>> {
  const page = await repo.listVisitors(
    parseOrThrow(listVisitorsSchema, params),
  );
  return { ...page, items: page.items.map(withReputation) };
}

const EMPTY_HISTORY: LineHistory = {
  resolved: 0,
  late: 0,
  damaged: 0,
  discarded: 0,
  lost: 0,
};

/** Historial completo, sin la ventana de la reputación. */
export async function getVisitorHistory(id: number): Promise<LineHistory> {
  const found = await repo.findVisitorHistory(parseOrThrow(idSchema, id));
  return found ?? EMPTY_HISTORY;
}

export async function getVisitorItem(id: number): Promise<VisitorListItem> {
  const found = await repo.findVisitorItemById(parseOrThrow(idSchema, id));
  if (!found) throw new NotFoundError(ENTITY, id);
  return withReputation(found);
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
        { path: "gradeId", message: "Los profesores no tienen curso" },
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
