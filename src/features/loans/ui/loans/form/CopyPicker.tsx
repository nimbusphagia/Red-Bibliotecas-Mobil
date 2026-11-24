import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import BookCopyPicker from "@/features/inventory/ui/picker/BookCopyPicker";
import type { FilterField } from "@/features/catalog/ui/list/searchFilters/FilterPanel";
import { toLoanCopy, type LoanCopy } from "../../options";

const PICKER_FIELDS: FilterField[] = [
  "author",
  "publisher",
  "category",
  "subcategory",
  "shelf",
];

const BOOK_PARAMS = { active: true };

const lendable = (c: CopyItem) =>
  c.status === "available" || c.status === "damaged";

type Props = {
  selected: LoanCopy[];
  onToggle: (copy: LoanCopy) => void;
  className?: string;
};

export default function CopyPicker({ selected, onToggle, className }: Props) {
  return (
    <BookCopyPicker<LoanCopy>
      className={className}
      selected={selected}
      onToggle={onToggle}
      filterFields={PICKER_FIELDS}
      bookParams={BOOK_PARAMS}
      loadCopies={(book, { shelfId }) =>
        listCopies({
          bookId: book.id,
          shelfId,
          excludeReleased: true,
          limit: 100,
        }).then((p) => p.items.filter(lendable))
      }
      toItem={(c, book) => toLoanCopy(c.id, c.labelText, book)}
      subtitle={(b) => String(b.availableCount)}
      emptyText="Sin ejemplares disponibles"
      autoFocus={false}
    />
  );
}
