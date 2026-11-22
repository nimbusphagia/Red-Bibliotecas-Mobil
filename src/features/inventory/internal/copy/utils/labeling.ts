import type { Tx } from "@/db/transaction";
import {
  clearCopiesLabeledSync,
  findLabeledTextsSync,
  findLabelCandidatesSync,
  setCopyLabeledSync,
} from "../repository";
import {
  RELEASED_STATUSES,
  type MarkLabeledResult,
  type RelabelResult,
} from "../types";

const isReleased = (status: string) =>
  (RELEASED_STATUSES as readonly string[]).includes(status);

/**
 * Guarda como tejuelo pegado el que el sistema deriva en este momento. Cada
 * ejemplar se resuelve por separado: los que fallan se informan y no impiden
 * marcar los demás.
 */
export function markLabeledSync(
  tx: Tx,
  copyIds: number[],
  actorId: number,
): MarkLabeledResult {
  const found = new Map(findLabelCandidatesSync(tx, copyIds).map((c) => [c.id, c]));
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
    else if (c.labeledAt !== null) result.alreadyLabeled.push(id);
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
    if (taken.has(text)) {
      result.failed.push({ copyId: id, reason: "conflict" });
      continue;
    }
    setCopyLabeledSync(tx, id, text, actorId);
    taken.add(text);
    result.labeled.push(id);
  }
  return result;
}

/** Devuelve los ejemplares a pendientes para volver a imprimir su etiqueta. */
export function relabelSync(tx: Tx, copyIds: number[]): RelabelResult {
  const found = new Map(findLabelCandidatesSync(tx, copyIds).map((c) => [c.id, c]));
  const result: RelabelResult = { relabeled: [], failed: [] };

  for (const id of copyIds) {
    const c = found.get(id);
    if (!c) result.failed.push({ copyId: id, reason: "not_found" });
    else if (isReleased(c.status))
      result.failed.push({ copyId: id, reason: "released" });
    else if (c.labeledAt === null)
      result.failed.push({ copyId: id, reason: "not_labeled" });
    else result.relabeled.push(id);
  }
  clearCopiesLabeledSync(tx, result.relabeled);
  return result;
}
