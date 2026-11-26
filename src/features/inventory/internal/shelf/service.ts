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
import {
  findCopiesByIdsSync,
  setCopiesShelfSync,
  summarizeCopies,
} from "../copy/repository";
import type { CopyStatus, CopySummary } from "../copy/types";
import { requireStockRole } from "../movement/utils/auth";
import * as repo from "./repository";
import { searchKey } from "@/features/shared/format/text";
import {
  createShelfSchema,
  listShelvesSchema,
  moveCopiesSchema,
  updateShelfSchema,
  type MoveCopiesInput,
  type ShelfListParams,
} from "./schemas";
import type {
  NewShelf,
  Shelf,
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

/** Conteos de los ejemplares activos del estante. */
export async function getShelfSummary(shelfId: number): Promise<CopySummary> {
  await getShelf(shelfId);
  return summarizeCopies({ shelfId, tokens: [], excludeReleased: true });
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
  lost: "El ejemplar está perdido",
  discarded: "El ejemplar está descartado",
};

export async function moveCopies(
  actorId: number,
  input: MoveCopiesInput,
): Promise<{ shelf: Shelf; moved: number }> {
  await requireStockRole(actorId, "move copies");
  const { shelfId, copyIds } = parseOrThrow(moveCopiesSchema, input);
  const target = await getShelf(shelfId);

  const moved = inTransaction((tx) => {
    const found = new Map(
      findCopiesByIdsSync(tx, copyIds).map((c) => [c.id, c]),
    );
    const issues: ValidationIssue[] = [];
    copyIds.forEach((id, i) => {
      const c = found.get(id);
      const message = c ? NOT_MOVABLE[c.status] : "El ejemplar no existe";
      if (message) issues.push({ path: `copyIds.${i}`, message });
    });
    if (issues.length > 0) throw new ValidationError(issues);

    const toMove = copyIds.filter((id) => found.get(id)!.shelfId !== shelfId);
    setCopiesShelfSync(tx, toMove, shelfId);
    return toMove.length;
  });

  return { shelf: target, moved };
}
