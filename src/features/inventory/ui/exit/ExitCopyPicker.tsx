import type { FilterField } from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import type { ExitReason } from "@/features/inventory/internal/movement/types";
import { useCallback } from "react";
import BookCopyPicker from "../picker/BookCopyPicker";
import { canExit } from "./canExit";

const FIELDS: FilterField[] = [
  "author",
  "publisher",
  "category",
  "subcategory",
  "shelf",
];

type Props = {
  reason: ExitReason;
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  className?: string;
};

/** Libros con ejemplares que pueden salir por el motivo elegido. */
export default function ExitCopyPicker({
  reason,
  selected,
  onToggle,
  className,
}: Props) {
  const accept = useCallback((c: CopyItem) => canExit(c, reason), [reason]);

  return (
    <BookCopyPicker<CopyItem>
      className={className}
      selected={selected}
      onToggle={onToggle}
      filterFields={FIELDS}
      reloadKey={reason}
      loadCopies={(book, { shelfId }) =>
        listCopies({
          bookId: book.id,
          shelfId,
          excludeReleased: true,
          limit: 100,
        }).then((p) => p.items.filter(accept))
      }
      toItem={(copy) => copy}
      acceptCopy={accept}
      subtitle={(b) => `${b.activeCount} ejemplares`}
      emptyText="Sin ejemplares que puedan salir"
    />
  );
}
