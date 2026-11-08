import type { Tx } from "@/db/transaction";
import {
  CopiesNotExitableError,
  type CopyProblem,
  type CopyProblemKind,
} from "@/errors/errors";
import {
  findCopiesByIdsSync,
  setCopiesStatusSync,
} from "../../copy/repository";
import type { CopyLookup } from "../../copy/types";
import { releaseCopiesSync } from "../../copy/utils/release";
import { insertExitMovementSync, insertMovementLinesSync } from "../repository";
import {
  EXIT_STATUS,
  type ExitResult,
  type ExitStatus,
  type NewExitMovement,
} from "../types";

type ExitOptions = {
  allowOnLoan?: boolean;
};

function problemFor(
  c: CopyLookup,
  target: ExitStatus,
  allowOnLoan: boolean,
): CopyProblemKind | null {
  switch (c.status) {
    case "available":
      return null;
    case "damaged":
      return target === "damaged" ? "already_damaged" : null;
    case "on_loan":
      return allowOnLoan && target !== "discarded" ? null : "on_loan";
    case "lost":
      return "lost";
    case "discarded":
      return "discarded";
  }
}

export function writeExit(
  tx: Tx,
  header: NewExitMovement,
  copyIds: number[],
  { allowOnLoan = false }: ExitOptions = {},
): ExitResult {
  const target = EXIT_STATUS[header.reason];
  const found = new Map(
    findCopiesByIdsSync(tx, copyIds).map((c) => [c.id, c] as const),
  );

  const problems: CopyProblem[] = [];
  for (const copyId of copyIds) {
    const c = found.get(copyId);
    const problem = c ? problemFor(c, target, allowOnLoan) : "not_found";
    if (problem) {
      problems.push({ copyId, labelText: c?.labelText ?? null, problem });
    }
  }
  if (problems.length > 0) throw new CopiesNotExitableError(problems);

  const movement = insertExitMovementSync(tx, header);
  if (target === "damaged") setCopiesStatusSync(tx, copyIds, "damaged");
  else releaseCopiesSync(tx, copyIds, target);
  insertMovementLinesSync(tx, movement.id, copyIds);

  return {
    movement,
    copies: copyIds.map((copyId) => {
      const c = found.get(copyId)!;
      return {
        copyId,
        bookId: c.bookId,
        title: c.title,
        copyNumber: c.copyNumber,
        labelText: c.labelText,
        previousStatus: c.status,
        newStatus: target,
      };
    }),
  };
}
