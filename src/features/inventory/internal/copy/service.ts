import { db } from "@/db/client";
import { inTransaction } from "@/db/transaction";
import { getBook } from "@/features/catalog/internal/book/service";
import {
  NotFoundError,
  ValidationError,
} from "@/features/shared/errors/errors";
import { idSchema } from "@/features/shared/types/schemas";
import type { Page } from "@/features/shared/types/types";
import { parseOrThrow } from "@/features/shared/validation/validation";
import { requireStockRole } from "../movement/utils/auth";
import {
  clearCopyDamagedSync,
  findCopiesByIdsSync,
  findCopyById,
  findLabelCandidatesSync,
  markCopiesDamagedSync,
  listCopies as listCopiesRepo,
  listCopyBooks as listCopyBooksRepo,
} from "./repository";
import {
  labelCopiesSchema,
  listCopiesSchema,
  listCopyBooksSchema,
  setDamagedSchema,
  type CopyBookListParams,
  type CopyListParams,
  type LabelCopiesInput,
  type SetDamagedInput,
} from "./schemas";
import {
  RELEASED_STATUSES,
  type CopyBook,
  type CopyItem,
  type MarkLabeledResult,
  type PrintLabelsResult,
} from "./types";
import { markLabeledSync } from "./utils/labeling";

export async function getCopy(id: number): Promise<CopyItem> {
  const validId = parseOrThrow(idSchema, id);
  const found = await findCopyById(validId);
  if (!found) throw new NotFoundError("copy", validId);
  return found;
}

/** Libros con sus conteos de etiquetado, para la lista agrupada. */
export async function listCopyBooks(
  params: CopyBookListParams = {},
): Promise<Page<CopyBook>> {
  return listCopyBooksRepo(parseOrThrow(listCopyBooksSchema, params));
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

/**
 * El tejuelo más actual de cada ejemplar (el que se derivaría hoy), para
 * imprimirlo. Es independiente de marcar: no cambia nada y se puede repetir.
 * Mantiene el orden pedido; los que no se pueden armar vuelven en `skipped`.
 */
export async function listPrintLabels(
  input: LabelCopiesInput,
): Promise<PrintLabelsResult> {
  const { copyIds } = parseOrThrow(labelCopiesSchema, input);
  const found = new Map(
    findLabelCandidatesSync(db, copyIds).map((c) => [c.id, c]),
  );
  const result: PrintLabelsResult = { labels: [], skipped: [] };
  for (const copyId of copyIds) {
    const c = found.get(copyId);
    if (!c) result.skipped.push({ copyId, reason: "not_found" });
    else if ((RELEASED_STATUSES as readonly string[]).includes(c.status))
      result.skipped.push({ copyId, reason: "released" });
    else if (c.derivedText === null)
      result.skipped.push({ copyId, reason: "incomplete" });
    else result.labels.push({ copyId, text: c.derivedText });
  }
  return result;
}

/** Marca un ejemplar como deteriorado o lo da por reparado. No cambia su estado. */
export async function setCopyDamaged(
  actorId: number,
  input: SetDamagedInput,
): Promise<void> {
  await requireStockRole(actorId, "mark copies damaged");
  const { copyId, damaged } = parseOrThrow(setDamagedSchema, input);
  inTransaction((tx) => {
    const [c] = findCopiesByIdsSync(tx, [copyId]);
    if (!c) throw new NotFoundError("copy", copyId);
    if ((RELEASED_STATUSES as readonly string[]).includes(c.status)) {
      throw new ValidationError([
        {
          path: "copyId",
          message: `El ejemplar está ${c.status === "lost" ? "perdido" : "descartado"}`,
        },
      ]);
    }
    if (damaged) markCopiesDamagedSync(tx, [copyId], actorId);
    else clearCopyDamagedSync(tx, copyId);
  });
}
