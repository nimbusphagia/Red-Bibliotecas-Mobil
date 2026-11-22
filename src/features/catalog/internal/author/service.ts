import { searchKey } from "@/features/shared/format/text";
import { Page } from "@/features/shared/types/types";
import { parseOrThrow } from "@/features/shared/validation/validation";
import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "../_shared/service";
import * as repo from "./repository";
import {
  createAuthorSchema,
  listAuthorsSchema,
  updateAuthorSchema,
  type AuthorListParams,
} from "./schemas";
import type {
  Author,
  AuthorUsage,
  AuthorWithBookCount,
  NewAuthor,
} from "./types";

import { authorCode } from "../_shared/codes";
const ENTITY = "author";

const authorKey = (firstName: string, lastName: string | null) =>
  lastName
    ? `${searchKey(lastName)},${searchKey(firstName)}`
    : searchKey(firstName);

const isProtected = (a: Author) => a.isProtected;

export const { get: getAuthor, getUsage: getAuthorUsage } = makeReads<
  Author,
  AuthorUsage
>(ENTITY, {
  findById: repo.findAuthorById,
  countUsage: repo.countAuthorUsage,
});

export async function listAuthors(
  params: AuthorListParams = {},
): Promise<Page<AuthorWithBookCount>> {
  return repo.listAuthors(parseOrThrow(listAuthorsSchema, params));
}

export const createAuthor = makeCreate({
  entity: ENTITY,
  schema: createAuthorSchema,
  build: ({ firstName, lastName }): NewAuthor => ({
    firstName,
    lastName,
    nameKey: authorKey(firstName, lastName),
    code: authorCode(firstName, lastName),
  }),
  insert: repo.insertAuthor,
});

export const updateAuthor = makeUpdate({
  entity: ENTITY,
  schema: updateAuthorSchema,
  find: repo.findAuthorById,
  update: repo.updateAuthor,
  isProtected,
  build: (existing, patch): Partial<NewAuthor> => {
    const firstName = patch.firstName ?? existing.firstName;
    const lastName =
      patch.lastName !== undefined ? patch.lastName : existing.lastName;
    return {
      firstName,
      lastName,
      nameKey: authorKey(firstName, lastName),
      code: authorCode(firstName, lastName),
    };
  },
});

export const deleteAuthor = makeRemove({
  entity: ENTITY,
  find: repo.findAuthorById,
  countUsage: repo.countAuthorUsage,
  deleteIfUnused: repo.deleteAuthorIfUnused,
  isProtected,
});
