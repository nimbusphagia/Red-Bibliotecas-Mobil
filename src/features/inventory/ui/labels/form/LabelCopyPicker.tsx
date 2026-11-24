import { listCopies } from "@/features/inventory/internal/copy/service";
import {
  RELEASED_STATUSES,
  type CopyItem,
} from "@/features/inventory/internal/copy/types";
import { InlineFilter } from "@/features/shared/components";
import { useMemo, useState } from "react";
import BookCopyPicker from "../../picker/BookCopyPicker";
import { LABEL_STATE_ICON, labelStateOf } from "../labelState";

type StateFilter = "pending" | "outdated";

const FILTERS: { value: StateFilter; label: string }[] = [
  { value: "pending", label: "Sin etiquetar" },
  { value: "outdated", label: "Desactualizados" },
];

const notReleased = (c: CopyItem) =>
  !RELEASED_STATUSES.some((s) => s === c.status);

type Props = {
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  className?: string;
};

/** Libros con ejemplares por etiquetar; se elige cada ejemplar por su #id. */
export default function LabelCopyPicker({
  selected,
  onToggle,
  className,
}: Props) {
  const [state, setState] = useState<StateFilter>("pending");
  const bookParams = useMemo(() => ({ labelState: state }), [state]);

  return (
    <BookCopyPicker<CopyItem>
      className={className}
      selected={selected}
      onToggle={onToggle}
      filterFields={["shelf"]}
      panelOnly
      bookParams={bookParams}
      reloadKey={state}
      toolbarExtra={
        <InlineFilter options={FILTERS} value={state} onChange={setState} />
      }
      // Buscando por #id se muestran todos los ejemplares activos del libro,
      // sin importar el estado, para poder volver a elegir uno ya etiquetado.
      loadCopies={(book, { shelfId, byId }) =>
        listCopies({
          bookId: book.id,
          shelfId,
          excludeReleased: true,
          labeled: byId || state === "outdated" ? undefined : false,
          outdated: !byId && state === "outdated" ? true : undefined,
          limit: 100,
        }).then((p) => p.items)
      }
      toItem={(copy) => copy}
      chipIcon={(c) => LABEL_STATE_ICON[labelStateOf(c)]}
      acceptCopy={notReleased}
      subtitle={(b) => `${b.activeCount} ejemplares`}
      emptyText="Sin ejemplares por etiquetar"
      autoFocus={false}
    />
  );
}
