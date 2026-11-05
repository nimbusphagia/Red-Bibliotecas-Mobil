import { searchKey } from "@/shared/format/text";
import { parseOrThrow } from "@/shared/validation/validation";
import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "../_shared/service";
import * as repo from "./repository";
import {
  createPublisherSchema,
  listPublishersSchema,
  updatePublisherSchema,
  type PublisherListParams,
} from "./schemas";
import type {
  NewPublisher,
  Publisher,
  PublisherUsage,
  PublisherWithBookCount,
} from "./types";

const ENTITY = "publisher";

export const { get: getPublisher, getUsage: getPublisherUsage } = makeReads<
  Publisher,
  PublisherUsage
>(ENTITY, {
  findById: repo.findPublisherById,
  countUsage: repo.countPublisherUsage,
});

export async function listPublishers(
  params: PublisherListParams = {},
): Promise<PublisherWithBookCount[]> {
  return repo.listPublishers(parseOrThrow(listPublishersSchema, params));
}

export const createPublisher = makeCreate({
  entity: ENTITY,
  schema: createPublisherSchema,
  build: ({ name }): NewPublisher => ({ name, nameKey: searchKey(name) }),
  insert: repo.insertPublisher,
});

export const updatePublisher = makeUpdate({
  entity: ENTITY,
  schema: updatePublisherSchema,
  find: repo.findPublisherById,
  update: repo.updatePublisher,
  build: (_, { name }): Partial<NewPublisher> =>
    name === undefined ? {} : { name, nameKey: searchKey(name) },
});

export const deletePublisher = makeRemove({
  entity: ENTITY,
  find: repo.findPublisherById,
  countUsage: repo.countPublisherUsage,
  deleteIfUnused: repo.deletePublisherIfUnused,
});
