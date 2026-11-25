import type { Tx } from "@/db/transaction";
import { CopyNotRecoverableError } from "@/features/shared/errors/errors";
import {
  findActiveCopyByNumberSync,
  findLabeledTextsSync,
  setCopiesStatusSync,
} from "../../copy/repository";
import {
  findOpenExitLineSync,
  insertEntryMovementSync,
  insertMovementLinesSync,
} from "../repository";
import {
  EXIT_STATUS,
  RECOVERABLE_REASONS,
  type ExitLine,
  type RecoverableReason,
  type RecoveryResult,
} from "../types";

const isRecoverable = (
  line: ExitLine,
): line is ExitLine & { reason: RecoverableReason } =>
  (RECOVERABLE_REASONS as readonly string[]).includes(line.reason);

/** Un ejemplar perdido solo vuelve si nadie ocupó su número ni su tejuelo. */
function assertSlotFree(tx: Tx, line: ExitLine): void {
  const byNumber = findActiveCopyByNumberSync(tx, line.bookId, line.copyNumber);
  if (byNumber !== null) {
    throw new CopyNotRecoverableError(line.copyId, "number_taken", byNumber);
  }
  if (line.labeledText === null) return;
  const byLabel = findLabeledTextsSync(tx, [line.labeledText]).get(
    line.labeledText,
  );
  if (byLabel !== undefined) {
    throw new CopyNotRecoverableError(line.copyId, "label_taken", byLabel);
  }
}

/**
 * Revierte la última salida por pérdida del ejemplar con una entrada
 * `recovery` enlazada a ella. La salida queda en el historial. Si estaba
 * deteriorado, lo sigue estando.
 */
export function writeRecovery(
  tx: Tx,
  copyId: number,
  signedById: number,
  notes: string | null,
): RecoveryResult {
  const line = findOpenExitLineSync(tx, copyId);
  if (!line || !isRecoverable(line)) {
    throw new CopyNotRecoverableError(copyId, "nothing_to_recover");
  }
  if (line.status !== EXIT_STATUS[line.reason]) {
    throw new CopyNotRecoverableError(copyId, "status_changed");
  }

  assertSlotFree(tx, line);

  const movement = insertEntryMovementSync(tx, {
    reason: "recovery",
    signedById,
    notes,
  });
  setCopiesStatusSync(tx, [copyId], "available");
  insertMovementLinesSync(tx, movement.id, [copyId], {
    recoveredLineByCopy: new Map([[copyId, line.id]]),
  });

  return {
    movement,
    copyId,
    previousStatus: line.status,
    newStatus: "available",
  };
}
