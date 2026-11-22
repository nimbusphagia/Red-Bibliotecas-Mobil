import { getBookItem } from "@/features/catalog/internal/book/service";
import {
  getCopy,
  listCopies,
} from "@/features/inventory/internal/copy/service";
import {
  RELEASED_STATUSES,
  type CopyItem,
} from "@/features/inventory/internal/copy/types";
import { InlineFilter } from "@/features/shared/components";
import { LABEL_STATE_ES } from "@/features/shared/format/translate";
import { useState } from "react";
import BookCopyPicker from "../../picker/BookCopyPicker";
import { labelStateOf } from "../labelState";

type StateFilter = "pending" | "outdated";

const FILTERS: { value: StateFilter; label: string }[] = [
  { value: "pending", label: "Sin etiquetar" },
  { value: "outdated", label: "Desactualizados" },
];

type Props = {
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  className?: string;
};

async function bookOfCopy(id: number) {
  const copy = await getCopy(id).catch(() => null);
  if (!copy || RELEASED_STATUSES.some((s) => s === copy.status)) return null;
  return getBookItem(copy.bookId);
}

/** Libros con ejemplares por etiquetar; se elige cada ejemplar por su #id. */
export default function LabelCopyPicker({
  selected,
  onToggle,
  className,
}: Props) {
  const [state, setState] = useState<StateFilter>("pending");

  return (
    <BookCopyPicker<CopyItem>
      className={className}
      selected={selected}
      onToggle={onToggle}
      filterFields={["shelf"]}
      bookParams={{ labelState: state }}
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
      chipDetail={(c) => LABEL_STATE_ES[labelStateOf(c)]}
      bookOfCopy={bookOfCopy}
      subtitle={(b) => `${b.activeCount} ejemplares`}
      emptyText="Sin ejemplares por etiquetar"
    />
  );
}
