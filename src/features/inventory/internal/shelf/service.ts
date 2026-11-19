import { inTransaction } from "@/db/transaction";
import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "@/features/catalog/internal/_shared/service";
import {
  ValidationError,
  type ValidationIssue,
} from "@/features/shared/errors/errors";
import type { Page } from "@/features/shared/types/types";
import { parseOrThrow } from "@/features/shared/validation/validation";
import { findCopiesByIdsSync, setCopiesShelfSync } from "../copy/repository";
import type { CopyStatus } from "../copy/types";
import { requireStockRole } from "../movement/utils/auth";
import * as repo from "./repository";
import { searchKey } from "@/features/shared/format/text";
import {
  createShelfSchema,
  listShelfCopiesSchema,
  listShelvesSchema,
  moveCopiesSchema,
  updateShelfSchema,
  type MoveCopiesInput,
  type ShelfCopiesParams,
  type ShelfListParams,
} from "./schemas";
import type {
  NewShelf,
  Shelf,
  ShelfCopy,
  ShelfListItem,
  ShelfPatch,
  ShelfUsage,
} from "./types";

const ENTITY = "shelf";

export const { get: getShelf, getUsage: getShelfUsage } = makeReads<
  Shelf,
  ShelfUsage
>(ENTITY, {
  findById: repo.findShelfById,
  countUsage: repo.countShelfUsage,
});

export async function listShelves(
  params: ShelfListParams = {},
): Promise<Page<ShelfListItem>> {
  return repo.listShelves(parseOrThrow(listShelvesSchema, params));
}

export async function listShelfCopies(
  params: ShelfCopiesParams,
): Promise<Page<ShelfCopy>> {
  const { shelfId, ...page } = parseOrThrow(listShelfCopiesSchema, params);
  await getShelf(shelfId);
  return repo.listShelfCopies(shelfId, page);
}

export const createShelf = makeCreate({
  entity: ENTITY,
  schema: createShelfSchema,
  build: ({ name, description }): NewShelf => ({
    name,
    nameKey: searchKey(name),
    description,
  }),
  insert: repo.insertShelf,
});

export const updateShelf = makeUpdate({
  entity: ENTITY,
  schema: updateShelfSchema,
  find: repo.findShelfById,
  update: repo.updateShelf,
  build: (_, { name, description }): ShelfPatch => ({
    ...(name !== undefined && { name, nameKey: searchKey(name) }),
    ...(description !== undefined && { description }),
  }),
});

export const deleteShelf = makeRemove({
  entity: ENTITY,
  find: repo.findShelfById,
  countUsage: repo.countShelfUsage,
  deleteIfUnused: repo.deleteShelfIfUnused,
  isProtected: (s) => s.isDefault,
});

const NOT_MOVABLE: Partial<Record<CopyStatus, string>> = {
  on_loan: "The copy is on loan",
  lost: "The copy is lost",
  discarded: "The copy is discarded",
};

export async function moveCopies(
  actorId: number,
  input: MoveCopiesInput,
): Promise<{ shelf: Shelf; moved: number }> {
  await requireStockRole(actorId, "move copies");
  const { shelfId, copyIds } = parseOrThrow(moveCopiesSchema, input);
  const target = await getShelf(shelfId);

  inTransaction((tx) => {
    const found = new Map(
      findCopiesByIdsSync(tx, copyIds).map((c) => [c.id, c]),
    );
    const issues: ValidationIssue[] = [];
    copyIds.forEach((id, i) => {
      const c = found.get(id);
      const message = c ? NOT_MOVABLE[c.status] : "The copy does not exist";
      if (message) issues.push({ path: `copyIds.${i}`, message });
    });
    if (issues.length > 0) throw new ValidationError(issues);
    setCopiesShelfSync(tx, copyIds, shelfId);
  });

  return { shelf: target, moved: copyIds.length };
}
