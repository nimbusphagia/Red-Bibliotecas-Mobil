import type { Tx } from "@/db/transaction";
import { revokeLabelsSync } from "../../label/repository";
import { setCopiesStatusSync } from "../repository";
import type { ReleasedStatus } from "../types";

export function releaseCopiesSync(
  tx: Tx,
  copyIds: number[],
  status: ReleasedStatus,
): void {
  setCopiesStatusSync(tx, copyIds, status);
  revokeLabelsSync(tx, copyIds);
}
