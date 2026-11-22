import type { Tx } from "@/db/transaction";
import { insertBookSync } from "@/features/catalog/internal/book/repository";
import { assertLabelAvailableSync } from "@/features/catalog/internal/book/labels";
import {
  activeCopyNumbersSync,
  findCopiesByIdsSync,
  insertCopiesSync,
} from "../../copy/repository";
import { nextFreeNumbers } from "../../copy/utils/numbering";
import {
  insertEntryMovementSync,
  insertMovementLinesSync,
} from "../repository";
import type { EntryResult, NewEntryMovement, RegisteredLine } from "../types";
import type { PreparedLine } from "./prepare";

export function writeEntry(
  tx: Tx,
  header: NewEntryMovement,
  lines: PreparedLine[],
): EntryResult {
  const movement = insertEntryMovementSync(tx, header);
  const allCopyIds: number[] = [];
  const registered: RegisteredLine[] = [];

  for (const line of lines) {
    const isNewBook = line.source.kind === "new";
    const bookId =
      line.source.kind === "existing"
        ? line.source.bookId
        : insertBookSync(tx, line.source.values, line.source.collaborators).id;
    // Un libro existente ya pasó esta comprobación al guardarse.
    if (isNewBook) assertLabelAvailableSync(tx, bookId, line.lineIndex);

    const numbers = nextFreeNumbers(
      activeCopyNumbersSync(tx, bookId),
      line.quantity,
    );
    const copies = insertCopiesSync(
      tx,
      numbers.map((copyNumber) => ({
        bookId,
        shelfId: line.shelfId,
        copyNumber,
      })),
    );
    const texts = new Map(
      findCopiesByIdsSync(
        tx,
        copies.map((c) => c.id),
      ).map((c) => [c.id, c.labelText]),
    );

    allCopyIds.push(...copies.map((c) => c.id));
    registered.push({
      lineIndex: line.lineIndex,
      bookId,
      title: line.title,
      isNewBook,
      titleCode: line.titleCode,
      copies: copies.map((c) => ({
        copyId: c.id,
        copyNumber: c.copyNumber,
        shelfId: c.shelfId,
        labelText: texts.get(c.id) ?? null,
      })),
    });
  }

  insertMovementLinesSync(tx, movement.id, allCopyIds);
  return { movement, lines: registered };
}
