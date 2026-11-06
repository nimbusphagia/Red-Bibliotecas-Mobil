import { stockMovement, stockMovementLine } from "@/db/schema";
import type { Executor } from "@/db/transaction";
import type { NewEntryMovement, StockMovement } from "./types";

export function insertEntryMovementSync(
  ex: Executor,
  values: NewEntryMovement,
): StockMovement {
  return ex
    .insert(stockMovement)
    .values({ ...values, type: "entry" })
    .returning()
    .get();
}

export function insertMovementLinesSync(
  ex: Executor,
  movementId: number,
  copyIds: number[],
): void {
  if (copyIds.length === 0) return;
  ex.insert(stockMovementLine)
    .values(copyIds.map((copyId) => ({ movementId, copyId })))
    .run();
}
