import { getBookItem } from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { getCopy } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  NotFoundError,
  ValidationError,
} from "@/features/shared/errors/errors";

/**
 * Un ejemplar por su #id junto con su libro; null si el #id no existe o no es
 * válido. Cualquier otro error se propaga.
 */
export async function findCopyWithBook(
  id: number,
): Promise<{ copy: CopyItem; book: BookListItem } | null> {
  try {
    const copy = await getCopy(id);
    return { copy, book: await getBookItem(copy.bookId) };
  } catch (e) {
    if (e instanceof NotFoundError || e instanceof ValidationError) return null;
    throw e;
  }
}
