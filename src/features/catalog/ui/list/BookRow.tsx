import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { formatContributors } from "@/features/shared/format/text";
import { Link } from "expo-router";
import { Eye, PencilLine } from "lucide-react-native";

type Props = {
  book: BookListItem;
};
export default function BookRow({ book }: Props) {
  return (
    <ListRow>
      <Column
        text={book.title}
        subtitle1={book.seriesName ? `"${book.seriesName}"` : undefined}
        variant="subtitled"
        containerClass="max-w-[350]"
      />
      <Column text={formatContributors(book.collaborators)} />
      <Column
        variant="subtitled"
        text={book.publisherName ?? undefined}
        subtitle1={book.collectionName ?? undefined}
      />
      <Column variant="actions" expand={false}>
        <Link
          href={{ pathname: "/catalog/form", params: { id: String(book.id) } }}
          asChild
        >
          <Button variant="soft" icon={PencilLine} />
        </Link>
        <Link href={`/catalog/${book.id}`} asChild>
          <Button variant="soft" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
