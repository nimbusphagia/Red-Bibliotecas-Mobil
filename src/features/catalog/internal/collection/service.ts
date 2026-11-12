import { searchKey } from "@/features/shared/format/text";
import { Page } from "@/features/shared/types/types";
import { parseOrThrow } from "@/features/shared/validation/validation";
import type { ReferenceUsage } from "../_shared/reference";
import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "../_shared/service";
import { getPublisher } from "../publisher/service";
import * as repo from "./repository";
import {
  createCollectionSchema,
  listCollectionsSchema,
  updateCollectionSchema,
  type CollectionListParams,
} from "./schemas";
import type {
  Collection,
  CollectionListItem,
  CollectionPatch,
  NewCollection,
} from "./types";

const ENTITY = "collection";

export const { get: getCollection, getUsage: getCollectionUsage } = makeReads<
  Collection,
  ReferenceUsage
>(ENTITY, {
  findById: repo.findCollectionById,
  countUsage: repo.countCollectionUsage,
});

export async function listCollections(
  params: CollectionListParams = {},
): Promise<Page<CollectionListItem>> {
  return repo.listCollections(parseOrThrow(listCollectionsSchema, params));
}

export const createCollection = makeCreate({
  entity: ENTITY,
  schema: createCollectionSchema,
  build: async ({ name, publisherId }): Promise<NewCollection> => {
    await getPublisher(publisherId);
    return { name, nameKey: searchKey(name), publisherId };
  },
  insert: repo.insertCollection,
});

export const updateCollection = makeUpdate({
  entity: ENTITY,
  schema: updateCollectionSchema,
  find: repo.findCollectionById,
  update: repo.updateCollection,
  build: (_, { name }): CollectionPatch =>
    name === undefined ? {} : { name, nameKey: searchKey(name) },
});

export const deleteCollection = makeRemove({
  entity: ENTITY,
  find: repo.findCollectionById,
  countUsage: repo.countCollectionUsage,
  deleteIfUnused: repo.deleteCollectionIfUnused,
});
