import type { Tx } from "@/db/transaction";
import {
  findLabeledTextsSync,
  findLabelCandidatesSync,
  setCopyLabeledSync,
} from "../repository";
import { RELEASED_STATUSES, type MarkLabeledResult } from "../types";

const isReleased = (status: string) =>
  (RELEASED_STATUSES as readonly string[]).includes(status);

/**
 * Guarda como tejuelo pegado el que el sistema deriva en este momento. Sirve
 * tanto para los pendientes como para los desactualizados (se vuelve a guardar
 * el texto de hoy, que es el que se reimprime). Cada ejemplar se resuelve por
 * separado: los que fallan se informan y no impiden marcar los demás.
 */
export function markLabeledSync(
  tx: Tx,
  copyIds: number[],
  actorId: number,
): MarkLabeledResult {
  const found = new Map(
    findLabelCandidatesSync(tx, copyIds).map((c) => [c.id, c]),
  );
  const result: MarkLabeledResult = {
    labeled: [],
    alreadyLabeled: [],
    failed: [],
  };

  const ready: { id: number; text: string }[] = [];
  for (const id of copyIds) {
    const c = found.get(id);
    if (!c) result.failed.push({ copyId: id, reason: "not_found" });
    else if (isReleased(c.status))
      result.failed.push({ copyId: id, reason: "released" });
    else if (c.labeledAt !== null && c.labeledText === c.derivedText)
      result.alreadyLabeled.push(id);
    else if (c.derivedText === null)
      result.failed.push({ copyId: id, reason: "incomplete" });
    else ready.push({ id, text: c.derivedText });
  }

  // Un texto ya pegado en otro ejemplar, o repetido dentro del mismo lote.
  const taken = findLabeledTextsSync(
    tx,
    ready.map((r) => r.text),
  );
  for (const { id, text } of ready) {
    const holder = taken.get(text);
    if (holder !== undefined && holder !== id) {
      result.failed.push({
        copyId: id,
        reason: "conflict",
        conflictingCopyId: holder,
      });
      continue;
    }
    setCopyLabeledSync(tx, id, text, actorId);
    taken.set(text, id);
    result.labeled.push(id);
  }
  return result;
}
