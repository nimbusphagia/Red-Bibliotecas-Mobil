import { db } from "@/db/client";
import { NotFoundError } from "@/errors/errors";
import { getBook } from "@/features/catalog/internal/book/service";
import { collapse } from "@/shared/format/text";
import { idSchema } from "@/shared/types/schemas";
import type { Page } from "@/shared/types/types";
import { parseOrThrow } from "@/shared/validation/validation";
import {
  findCopyByActiveLabelSync,
  findCopyById,
  listCopies,
} from "./repository";
import { listCopiesSchema, type CopyListParams } from "./schemas";
import type { CopyItem, CopyLookup } from "./types";

export async function findCopyByLabel(
  text: string,
): Promise<CopyLookup | null> {
  const clean = collapse(text);
  if (!clean) return null;
  return findCopyByActiveLabelSync(db, clean);
}

export async function getCopy(id: number): Promise<CopyItem> {
  const validId = parseOrThrow(idSchema, id);
  const found = await findCopyById(validId);
  if (!found) throw new NotFoundError("copy", validId);
  return found;
}

export async function listCopiesByBook(
  params: CopyListParams,
): Promise<Page<CopyItem>> {
  const filters = parseOrThrow(listCopiesSchema, params);
  await getBook(filters.bookId);
  return listCopies(filters);
}
