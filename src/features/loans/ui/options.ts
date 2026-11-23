import type { BookListItem } from "@/features/catalog/internal/book/types";
import { writersOf } from "@/features/catalog/ui/options";
import { findCopyWithBook } from "@/features/inventory/ui/picker/copyWithBook";
import { listVisitors } from "@/features/loans/internal/visitor/service";
import type { Option } from "@/features/shared/components";

export type LoanCopy = {
  id: number;
  labelText: string | null;
  title: string;
  author: string;
};

export const searchVisitors = async (search: string): Promise<Option[]> =>
  (await listVisitors({ search, active: true, limit: 20 })).items.map((v) => ({
    id: v.id,
    label: v.name,
  }));

export const toLoanCopy = (
  id: number,
  labelText: string | null,
  book: BookListItem,
): LoanCopy => ({ id, labelText, title: book.title, author: writersOf(book) });

export async function copyById(id: number) {
  const found = await findCopyWithBook(id);
  if (!found) return null;
  const { copy, book } = found;
  return { book, copy: toLoanCopy(copy.id, copy.labelText, book) };
}
