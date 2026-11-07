import { NotFoundError, ValidationError } from "@/errors/errors";
import { searchKey } from "@/shared/format/text";
import { mapWriteErrors, parseOrThrow } from "@/shared/validation/validation";
import { makeReads, parseId } from "../_shared/service";
import { getAuthor } from "../author/service";
import { getCategory } from "../category/service";
import { getCollection } from "../collection/service";
import { getPublisher } from "../publisher/service";
import { getSeries } from "../series/service";
import { getSubcategory } from "../subcategory/service";
import * as repo from "./repository";
import {
  createBookSchema,
  listBooksSchema,
  updateBookSchema,
  type BookInput,
  type BookListParams,
  type BookUpdateInput,
} from "./schemas";
import type {
  Book,
  BookCollaborator,
  BookListItem,
  BookPatch,
  BookUsage,
  BookWithCollaborators,
  NewBook,
} from "./types";
import type { Page } from "@/shared/types/types";

const ENTITY = "book";

export const { get: getBook, getUsage: getBookUsage } = makeReads<
  BookWithCollaborators,
  BookUsage
>(ENTITY, {
  findById: repo.findBookWithCollaborators,
  countUsage: repo.countBookUsage,
});

export async function listBooks(
  params: BookListParams = {},
): Promise<Page<BookListItem>> {
  return repo.listBooks(parseOrThrow(listBooksSchema, params));
}

// Validation
type RefIds = {
  publisherId?: number | null;
  categoryId?: number | null;
  subcategoryId?: number | null;
  collaborators?: BookCollaborator[];
};

async function assertReferences(r: RefIds): Promise<void> {
  const checks: Promise<unknown>[] = [];
  if (r.publisherId != null) checks.push(getPublisher(r.publisherId));
  if (r.categoryId != null) checks.push(getCategory(r.categoryId));
  if (r.subcategoryId != null) checks.push(getSubcategory(r.subcategoryId));
  for (const id of new Set(r.collaborators?.map((c) => c.authorId))) {
    checks.push(getAuthor(id));
  }
  await Promise.all(checks);
}

async function assertConsistent(final: {
  publisherId: number | null;
  collectionId: number | null;
  seriesId: number | null;
  collaborators: BookCollaborator[];
}): Promise<void> {
  if (final.collectionId !== null) {
    const found = await getCollection(final.collectionId);
    if (found.publisherId !== final.publisherId) {
      throw new ValidationError([
        {
          path: "collectionId",
          message: "The collection does not belong to the book's publisher",
        },
      ]);
    }
  }

  if (final.seriesId !== null) {
    const found = await getSeries(final.seriesId);
    const authored = final.collaborators.some(
      (c) => c.authorId === found.authorId && c.role !== "translator",
    );
    if (!authored) {
      throw new ValidationError([
        {
          path: "seriesId",
          message:
            "The series author must be a writer or illustrator of the book",
        },
      ]);
    }
  }
}

// Actions
export type PreparedBook = {
  values: NewBook;
  collaborators: BookCollaborator[];
};

export async function prepareBook(input: BookInput): Promise<PreparedBook> {
  const { collaborators, title, ...rest } = parseOrThrow(
    createBookSchema,
    input,
  );

  await assertReferences({ ...rest, collaborators });
  await assertConsistent({ ...rest, collaborators });

  return {
    values: { ...rest, title, titleKey: searchKey(title) },
    collaborators,
  };
}

export async function createBook(input: BookInput): Promise<Book> {
  const { values, collaborators } = await prepareBook(input);
  return mapWriteErrors(ENTITY, () => repo.insertBook(values, collaborators));
}

export async function updateBook(
  id: number,
  input: BookUpdateInput,
): Promise<BookWithCollaborators> {
  const validId = parseId(id);
  const { collaborators, title, ...rest } = parseOrThrow(
    updateBookSchema,
    input,
  );

  const existing = await getBook(validId);

  const patch = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  ) as BookPatch;

  if (title !== undefined) {
    patch.title = title;
    patch.titleKey = searchKey(title);
  }

  const publisherChanged =
    patch.publisherId !== undefined &&
    patch.publisherId !== existing.publisherId;
  if (publisherChanged && patch.collectionId === undefined) {
    patch.collectionId = null;
  }

  if (Object.keys(patch).length === 0 && !collaborators) return existing;

  await assertReferences({ ...patch, collaborators });

  const touchesConsistency =
    "publisherId" in patch ||
    "collectionId" in patch ||
    "seriesId" in patch ||
    collaborators !== undefined;

  if (touchesConsistency) {
    await assertConsistent({
      publisherId:
        patch.publisherId !== undefined
          ? patch.publisherId
          : existing.publisherId,
      collectionId:
        patch.collectionId !== undefined
          ? patch.collectionId
          : existing.collectionId,
      seriesId:
        patch.seriesId !== undefined ? patch.seriesId : existing.seriesId,
      collaborators: collaborators ?? existing.collaborators,
    });
  }

  const updated = await mapWriteErrors(ENTITY, () =>
    repo.updateBook(validId, patch, collaborators),
  );
  if (!updated) throw new NotFoundError(ENTITY, validId);

  return getBook(validId);
}
