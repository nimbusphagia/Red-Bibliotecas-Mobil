import { isUniqueViolation } from "@/shared/db-errors";
import { DuplicateError, InUseError, NotFoundError } from "@/shared/errors";
import { idSchema } from "@/shared/schemas";
import { parseOrThrow } from "@/shared/validation";
import * as repo from "./repository";
import {
  createAuthorSchema,
  listAuthorsSchema,
  updateAuthorSchema,
  type AuthorInput,
  type AuthorListParams,
  type AuthorUpdateInput,
} from "./schemas";
import type { Author, AuthorUsage, AuthorWithBookCount } from "./types";

// Helpers
const ENTITY = "author";

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
export async function listAuthors(
  params: AuthorListParams = {},
): Promise<AuthorWithBookCount[]> {
  return repo.listAuthors(parseOrThrow(listAuthorsSchema, params));
}

export async function getAuthor(id: number): Promise<Author> {
  const validId = parseId(id);
  const found = await repo.findAuthorById(validId);
  if (!found) throw new NotFoundError(ENTITY, validId);
  return found;
}

export async function getAuthorUsage(id: number): Promise<AuthorUsage> {
  const validId = parseId(id);
  const usage = await repo.countAuthorUsage(validId);
  if (!usage) throw new NotFoundError(ENTITY, validId);
  return usage;
}

// Write
export async function createAuthor(input: AuthorInput): Promise<Author> {
  const values = parseOrThrow(createAuthorSchema, input);
  return mapDuplicate(() => repo.insertAuthor(values));
}

export async function updateAuthor(
  id: number,
  patch: AuthorUpdateInput,
): Promise<Author> {
  const validId = parseId(id);
  const values = parseOrThrow(updateAuthorSchema, patch);

  if (Object.values(values).every((v) => v === undefined)) {
    return getAuthor(validId);
  }

  const updated = await mapDuplicate(() => repo.updateAuthor(validId, values));
  if (!updated) throw new NotFoundError(ENTITY, validId);
  return updated;
}

// Delete
export async function deleteAuthor(id: number): Promise<void> {
  const validId = parseId(id);

  if (await repo.deleteAuthorIfUnused(validId)) return;

  const usage = await repo.countAuthorUsage(validId);
  if (!usage) throw new NotFoundError(ENTITY, validId);

  const inUse = Object.fromEntries(
    Object.entries(usage).filter(([, n]) => n > 0),
  );
  throw new InUseError(ENTITY, validId, inUse);
}
