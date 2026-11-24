import type { BookListItem } from "@/features/catalog/internal/book/types";
import { ItemCard } from "@/features/shared/components";
import { formatContributors } from "@/features/shared/format/text";

type Props = {
  book: BookListItem;
};
export default function BookCard({ book }: Props) {
  const chips = [
    book.seriesName,
    book.collectionName,
    book.categoryName,
    book.subcategoryName,
  ].filter((t): t is string => !!t);

  return (
    <ItemCard
      title={book.title}
      subtitle={formatContributors(book.collaborators)}
      detail={book.publisherName}
      href={`/catalog/${book.id}`}
      chips={chips}
    />
  );
}
