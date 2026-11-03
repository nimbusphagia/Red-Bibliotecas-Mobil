import { isUniqueViolation } from "@/shared/db-errors";
import { DuplicateError, InUseError, NotFoundError } from "@/shared/errors";
import { idSchema } from "@/shared/schemas";
import { parseOrThrow } from "@/shared/validation";
import * as repo from "./repository";
import {
  createPublisherSchema,
  listPublishersSchema,
  updatePublisherSchema,
  type PublisherInput,
  type PublisherListParams,
  type PublisherUpdateInput,
} from "./schemas";
import type {
  Publisher,
  PublisherUsage,
  PublisherWithBookCount,
} from "./types";

// Helpers
const ENTITY = "publisher";

const parseId = (id: unknown) => parseOrThrow(idSchema, id);

async function mapDuplicate<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateError(ENTITY);
    throw error;
  }
}

// Read
export async function listPublishers(
  params: PublisherListParams = {},
): Promise<PublisherWithBookCount[]> {
  return repo.listPublishers(parseOrThrow(listPublishersSchema, params));
}

export async function getPublisher(id: number): Promise<Publisher> {
  const validId = parseId(id);
  const found = await repo.findPublisherById(validId);
  if (!found) throw new NotFoundError(ENTITY, validId);
  return found;
}

export async function getPublisherUsage(id: number): Promise<PublisherUsage> {
  const validId = parseId(id);
  const usage = await repo.countPublisherUsage(validId);
  if (!usage) throw new NotFoundError(ENTITY, validId);
  return usage;
}

// Write
export async function createPublisher(
  input: PublisherInput,
): Promise<Publisher> {
  const values = parseOrThrow(createPublisherSchema, input);
  return mapDuplicate(() => repo.insertPublisher(values));
}

export async function updatePublisher(
  id: number,
  patch: PublisherUpdateInput,
): Promise<Publisher> {
  const validId = parseId(id);
  const values = parseOrThrow(updatePublisherSchema, patch);

  if (Object.values(values).every((v) => v === undefined)) {
    return getPublisher(validId);
  }

  const updated = await mapDuplicate(() =>
    repo.updatePublisher(validId, values),
  );
  if (!updated) throw new NotFoundError(ENTITY, validId);
  return updated;
}

// Delete
export async function deletePublisher(id: number): Promise<void> {
  const validId = parseId(id);

  if (await repo.deletePublisherIfUnused(validId)) return;

  const usage = await repo.countPublisherUsage(validId);
  if (!usage) throw new NotFoundError(ENTITY, validId);

  const inUse = Object.fromEntries(
    Object.entries(usage).filter(([, n]) => n > 0),
  );
  throw new InUseError(ENTITY, validId, inUse);
}
