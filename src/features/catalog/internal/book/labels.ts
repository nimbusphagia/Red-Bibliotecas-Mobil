import type { Executor } from "@/db/transaction";
import { LabelConflictError } from "@/features/shared/errors/errors";
import {
  findBookByLabelPrefixSync,
  findLabeledCopySync,
  findLabelPrefixSync,
  findSeriesNameSync,
} from "./repository";

/**
 * Debe llamarse dentro de la misma transacción que guarda el libro: si otro
 * libro ya usa su tejuelo, lanza y la transacción deshace el guardado. Si el
 * libro aún no tiene categoría, subcategoría o escritor, no hay prefijo que
 * comparar y no hace nada (se vuelve a comprobar al etiquetar).
 */
export function assertLabelAvailableSync(
  ex: Executor,
  bookId: number,
  lineIndex?: number,
): void {
  const mine = findLabelPrefixSync(ex, bookId);
  if (!mine) return;

  const other = findBookByLabelPrefixSync(
    ex,
    mine.prefix,
    mine.titleCode,
    bookId,
  );
  if (!other) return;

  const sameSeries = mine.seriesId !== null && mine.seriesId === other.seriesId;
  const seriesName = sameSeries ? findSeriesNameSync(ex, mine.seriesId!) : null;
  throw new LabelConflictError({
    lineIndex,
    labelText: mine.prefix,
    conflictingBook: { id: other.id, title: other.title },
    conflictingCopy: findLabeledCopySync(ex, other.id, mine.prefix) ?? undefined,
    sameSeries,
    suggestedOmitWords: seriesName ? [seriesName] : undefined,
  });
}
