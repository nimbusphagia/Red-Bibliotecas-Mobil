import type { CopyStatus } from "@/features/inventory/internal/copy/types";

/** Perdido: se puede revertir con una recuperación. */
export const canRecover = (status: CopyStatus) => status === "lost";
