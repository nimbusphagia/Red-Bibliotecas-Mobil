import { listPrintLabels } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { toFormErrors } from "@/features/shared/errors/messages";
import { PRINT_SKIP_ES } from "@/features/shared/format/translate";
import { useState } from "react";
import LabelResultDialog, { type Problem } from "./LabelResultDialog";
import { shareLabelSheet } from "./printLabelSheet";

/**
 * Genera la hoja de tejuelos y la comparte. Imprimir no cambia nada: sirve
 * para cualquier ejemplar y se puede repetir. `dialog` lista los omitidos.
 */
export function usePrintLabels() {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string>();
  const [skipped, setSkipped] = useState<Problem[]>();

  const print = async (copies: Pick<CopyItem, "id" | "bookTitle">[]) => {
    if (printing || copies.length === 0) return;
    setError(undefined);
    setPrinting(true);
    try {
      const { labels, skipped: skippedCopies } = await listPrintLabels({
        copyIds: copies.map((c) => c.id),
      });
      if (labels.length > 0) await shareLabelSheet(labels);
      if (skippedCopies.length > 0) {
        const byId = new Map(copies.map((c) => [c.id, c]));
        setSkipped(
          skippedCopies.map((s) => ({
            copyId: s.copyId,
            name: byId.get(s.copyId)?.bookTitle ?? "",
            reason: PRINT_SKIP_ES[s.reason],
          })),
        );
      }
    } catch (e) {
      const f = toFormErrors(e);
      setError(f.form ?? Object.values(f.fields)[0]);
    } finally {
      setPrinting(false);
    }
  };

  const dialog = skipped && (
    <LabelResultDialog
      title="Algunos ejemplares no se imprimieron"
      problems={skipped}
      onClose={() => setSkipped(undefined)}
    />
  );

  return { printing, error, print, dialog };
}
