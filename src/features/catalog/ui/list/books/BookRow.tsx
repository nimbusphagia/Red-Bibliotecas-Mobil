import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookUp, Eye } from "lucide-react-native";

type Props = {
  book: BookListItem;
};
export default function BookRow({ book }: Props) {
  return (
    <PillRow>
      <Column text={`#${book.id}`} variant="id" />
      <Column
        text={book.title}
        subtitle1={book.publisherName ?? undefined}
        subtitle2={book.collectionName ?? undefined}
        variant="subtitled"
        containerClass="max-w-[300]"
      />
      <Column
        text={formatContributors(book.collaborators)}
        subtitle1={book.seriesName ? `"${book.seriesName}"` : undefined}
        variant="subtitled"
      />
      <Column
        text={`${book.availableCount} / ${book.activeCount}`}
        subtitle1={book.availableCount === 0 ? "No disponibles" : "Disponibles"}
        variant="subtitled"
        containerClass="max-w-[150px]"
      />
      <Column variant="actions" expand={false}>
        <>
          <Link href={`/catalog/${book.id}`} asChild>
            <Button
              variant="secondary"
              icon={<Eye size={18} color={colors.highlight} />}
            />
          </Link>
          <Button
            variant="highlight"
            icon={<BookUp size={18} color={colors.bg} />}
          />
        </>
      </Column>
    </PillRow>
  );
}

const formatContributors = (list: BookListItem["collaborators"]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};
