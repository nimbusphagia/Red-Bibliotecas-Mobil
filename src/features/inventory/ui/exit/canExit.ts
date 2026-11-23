import type { CopyItem } from "@/features/inventory/internal/copy/types";
import type { ExitReason } from "@/features/inventory/internal/movement/types";

/** Un ejemplar dañado solo puede salir por otro motivo que el daño. */
export const canExit = (c: Pick<CopyItem, "status">, reason: ExitReason) =>
  c.status === "available" || (c.status === "damaged" && reason !== "damage");
