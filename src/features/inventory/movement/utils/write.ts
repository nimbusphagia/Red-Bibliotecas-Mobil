import type { Tx } from "@/db/transaction";
import { insertBookSync } from "@/features/catalog/book/repository";
import { insertCopiesSync } from "../../copy/repository";
import { insertLabelsSync } from "../../label/repository";
import { buildLabelText } from "../../label/utils/labelText";
import { claimTexts, planLine, toConflictError, type Claims } from "./plan";
import type { PreparedLine } from "./prepare";
import {
  insertEntryMovementSync,
  insertMovementLinesSync,
} from "../repository";
import type { EntryResult, NewEntryMovement, RegisteredLine } from "../types";

export function writeEntry(
  tx: Tx,
  header: NewEntryMovement,
  lines: PreparedLine[],
): EntryResult {
  const movement = insertEntryMovementSync(tx, header);
  const claims: Claims = new Map();
  const allCopyIds: number[] = [];
  const registered: RegisteredLine[] = [];

  for (const line of lines) {
    const isNewBook = line.source.kind === "new";
    const bookId =
      line.source.kind === "existing"
        ? line.source.bookId
        : insertBookSync(tx, line.source.values, line.source.collaborators).id;

    const plan = planLine(tx, line, bookId, claims);
    if (plan.conflict) throw toConflictError(line, plan.conflict);

    const copies = insertCopiesSync(
      tx,
      plan.numbers.map((copyNumber) => ({
        bookId,
        shelfId: line.shelfId,
        copyNumber,
      })),
    );
    const labelRows = copies.map((c) => ({
      copyId: c.id,
      categoryCode: line.categoryCode,
      authorCode: line.authorCode,
      subcategoryCode: line.subcategoryCode,
      titleCode: plan.titleCode,
      copyNumber: c.copyNumber,
      text: buildLabelText({
        categoryCode: line.categoryCode,
        authorCode: line.authorCode,
        subcategoryCode: line.subcategoryCode,
        titleCode: plan.titleCode,
        copyNumber: c.copyNumber,
      }),
    }));
    insertLabelsSync(tx, labelRows);

    claimTexts(claims, line, bookId, plan.texts);
    allCopyIds.push(...copies.map((c) => c.id));
    registered.push({
      lineIndex: line.lineIndex,
      bookId,
      title: line.title,
      isNewBook,
      titleCode: plan.titleCode,
      titleCodeSource: plan.source,
      copies: copies.map((c, i) => ({
        copyId: c.id,
        copyNumber: c.copyNumber,
        shelfId: c.shelfId,
        labelText: labelRows[i].text,
      })),
    });
  }

  insertMovementLinesSync(tx, movement.id, allCopyIds);
  return { movement, lines: registered };
}
