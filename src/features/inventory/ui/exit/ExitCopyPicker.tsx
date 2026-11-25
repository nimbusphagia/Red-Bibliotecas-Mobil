import type { FilterField } from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import BookCopyPicker from "../picker/BookCopyPicker";

const FIELDS: FilterField[] = [
  "author",
  "publisher",
  "category",
  "subcategory",
  "shelf",
];

const canExit = (c: CopyItem) => c.status === "available";

type Props = {
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  className?: string;
};

/** Libros con ejemplares que pueden salir. */
export default function ExitCopyPicker({
  selected,
  onToggle,
  className,
}: Props) {
  return (
    <BookCopyPicker<CopyItem>
      className={className}
      selected={selected}
      onToggle={onToggle}
      filterFields={FIELDS}
      loadCopies={(book, { shelfId }) =>
        listCopies({
          bookId: book.id,
          shelfId,
          excludeReleased: true,
          limit: 100,
        }).then((p) => p.items.filter(canExit))
      }
      toItem={(copy) => copy}
      acceptCopy={canExit}
      subtitle={(b) => `${b.activeCount} ejemplares`}
      emptyText="Sin ejemplares que puedan salir"
    />
  );
}
