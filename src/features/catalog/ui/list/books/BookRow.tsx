import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { Link } from "expo-router";
import { BookUp, Eye } from "lucide-react-native";

type Props = {
  book: BookListItem;
};
export default function BookRow({ book }: Props) {
  return (
    <ListRow>
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
            <Button variant="secondary" icon={Eye} />
          </Link>
          <Button icon={BookUp} />
        </>
      </Column>
    </ListRow>
  );
}

const formatContributors = (list: BookListItem["collaborators"]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};
