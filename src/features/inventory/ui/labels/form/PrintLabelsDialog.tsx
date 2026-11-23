import {
  getCopy,
  listCopies,
} from "@/features/inventory/internal/copy/service";
import {
  RELEASED_STATUSES,
  type CopyItem,
} from "@/features/inventory/internal/copy/types";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  MultiSearchSelect,
  type Option,
} from "@/features/shared/components";
import { useState } from "react";
import { usePrintLabels } from "./usePrintLabels";

const toOption = (c: CopyItem): Option => ({
  id: c.id,
  label: `#${c.id}`,
  detail: c.bookTitle,
  caption: c.authors ?? undefined,
});

const released = (c: CopyItem) => RELEASED_STATUSES.some((s) => s === c.status);

// "#12" busca ese ejemplar sin importar su estado; si no, entre los etiquetados.
async function searchCopies(search: string): Promise<Option[]> {
  const id = search.trim().match(/^#(\d+)$/)?.[1];
  if (id) {
    const c = await getCopy(Number(id)).catch(() => null);
    return c && !released(c) ? [toOption(c)] : [];
  }
  const page = await listCopies({
    search,
    labeled: true,
    outdated: false,
    excludeReleased: true,
    sortBy: "createdAt",
    sortDir: "desc",
    limit: 30,
  });
  return page.items.map(toOption);
}

type Props = { initial: CopyItem[]; onClose: () => void };

/** Reimprime tejuelos de ejemplares ya etiquetados. */
export default function PrintLabelsDialog({ initial, onClose }: Props) {
  const [selected, setSelected] = useState(() => initial.map(toOption));
  const printer = usePrintLabels();

  const print = () =>
    printer.print(
      selected.map((o) => ({ id: o.id, bookTitle: o.detail ?? "" })),
    );

  return (
    <>
      <Dialog onClose={onClose}>
        <DialogHeader
          title="Imprimir tejuelos"
          subtitle={`${selected.length} seleccionados`}
        />
        <DialogBody>
          <MultiSearchSelect
            values={selected}
            onChange={setSelected}
            fetchOptions={searchCopies}
            placeholder="Agregar..."
          />
        </DialogBody>
        <FieldError>{printer.error}</FieldError>
        <DialogActions
          confirmTitle="Imprimir"
          loading={printer.printing}
          disabled={selected.length === 0}
          onConfirm={print}
          onCancel={onClose}
        />
      </Dialog>
      {printer.dialog}
    </>
  );
}
