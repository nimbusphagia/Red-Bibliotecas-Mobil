import { inTransaction } from "@/db/transaction";
import { getBook } from "@/features/catalog/internal/book/service";
import { NotFoundError } from "@/features/shared/errors/errors";
import { idSchema } from "@/features/shared/types/schemas";
import type { Page } from "@/features/shared/types/types";
import { parseOrThrow } from "@/features/shared/validation/validation";
import { requireStockRole } from "../movement/utils/auth";
import { findCopyById, listCopies as listCopiesRepo } from "./repository";
import {
  labelCopiesSchema,
  listCopiesSchema,
  type CopyListParams,
  type LabelCopiesInput,
} from "./schemas";
import type { CopyItem, MarkLabeledResult } from "./types";
import { markLabeledSync } from "./utils/labeling";

export async function getCopy(id: number): Promise<CopyItem> {
  const validId = parseOrThrow(idSchema, id);
  const found = await findCopyById(validId);
  if (!found) throw new NotFoundError("copy", validId);
  return found;
}

/** Ejemplares de todo el inventario, o de un libro si se pasa `bookId`. */
export async function listCopies(
  params: CopyListParams = {},
): Promise<Page<CopyItem>> {
  const filters = parseOrThrow(listCopiesSchema, params);
  if (filters.bookId !== undefined) await getBook(filters.bookId);
  return listCopiesRepo(filters);
}

/**
 * Registra que el tejuelo ya se pegó en el libro físico, con el texto que el
 * sistema deriva ahora. Los ejemplares con problema vuelven en `failed` y
 * siguen pendientes; el resto queda marcado.
 */
export async function markCopiesLabeled(
  actorId: number,
  input: LabelCopiesInput,
): Promise<MarkLabeledResult> {
  await requireStockRole(actorId, "label copies");
  const { copyIds } = parseOrThrow(labelCopiesSchema, input);
  return inTransaction((tx) => markLabeledSync(tx, copyIds, actorId));
}
