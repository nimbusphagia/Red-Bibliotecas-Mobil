import type { FilterField } from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import { listCopies } from "@/features/inventory/internal/copy/service";
import BookCopyPicker from "../../picker/BookCopyPicker";
import { toMoveCopy, type MoveCopy } from "../options";

const PICKER_FIELDS: FilterField[] = ["shelf"];

type Props = {
  selected: MoveCopy[];
  onToggle: (copy: MoveCopy) => void;
  className?: string;
};

export default function ShelfCopyPicker({
  selected,
  onToggle,
  className,
}: Props) {
  return (
    <BookCopyPicker<MoveCopy>
      className={className}
      selected={selected}
      onToggle={onToggle}
      filterFields={PICKER_FIELDS}
      panelOnly
      filterInSearchRow
      loadCopies={(book, { shelfId }) =>
        listCopies({
          bookId: book.id,
          shelfId,
          excludeReleased: true,
          limit: 100,
        }).then((p) => p.items)
      }
      toItem={(c) => toMoveCopy(c)}
      chipDetail={(c) => (c.status === "on_loan" ? "Prestado" : undefined)}
      subtitle={(b) => String(b.activeCount)}
      emptyText={(shelfId) =>
        shelfId === undefined
          ? "Sin ejemplares"
          : "Sin ejemplares en esta estantería"
      }
    />
  );
}
