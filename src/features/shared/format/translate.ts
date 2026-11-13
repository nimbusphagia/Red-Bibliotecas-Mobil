import { CopyStatus } from "@/features/inventory/internal/copy/types";

export const COPY_STATUS_ES: Record<CopyStatus, string> = {
  available: "Disponible",
  on_loan: "Prestado",
  lost: "Perdido",
  discarded: "Descartado",
  damaged: "Dañado",
};
