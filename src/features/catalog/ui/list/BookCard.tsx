import type { BookListItem } from "@/features/catalog/internal/book/types";
import { ItemCard, type ChipItem } from "@/features/shared/components";
import { formatContributors } from "@/features/shared/format/text";
import type { AccentLevel } from "@/features/shared/theme";

type Props = {
  book: BookListItem;
};

const chip = (
  label: string | false | null,
  accent?: AccentLevel,
): ChipItem[] => (label ? [{ label, accent }] : []);

export default function BookCard({ book }: Props) {
  const chips = [
    ...chip(book.damagedCount > 0 && "Ejemplares deteriorados", "neg"),
    ...chip(book.outdatedCount > 0 && "Tejuelos desactualizados", "neg"),
    ...chip(book.seriesName && `"${book.seriesName}"`, "md"),
    ...chip(book.collectionName, "sm"),
    ...chip(book.categoryName),
    ...chip(book.subcategoryName),
  ];

  return (
    <ItemCard
      title={book.title}
      subtitle={formatContributors(book.collaborators)}
      detail={book.publisherName}
      href={`/catalog/${book.id}`}
      chips={chips}
      note={`${book.activeCount} ${book.activeCount === 1 ? "ejemplar" : "ejemplares"}`}
      className="py-6"
    />
  );
}
