import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Button, ChipRow, Surface, Text } from "@/features/shared/components";
import { formatContributors } from "@/features/shared/format/text";
import { Link } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  book: BookListItem;
};
export default function BookCard({ book }: Props) {
  const authors = formatContributors(book.collaborators);
  const tags = [
    book.seriesName,
    book.collectionName,
    book.categoryName,
    book.subcategoryName,
  ].filter((t): t is string => !!t);

  return (
    <Surface row className="grow justify-between gap-4 p-4">
      <View className="flex-row items-start gap-2">
        <View className="flex-1 gap-1">
          <Text variant="item" numberOfLines={2}>
            {book.title}
          </Text>
          {!!authors && (
            <Text variant="caption" numberOfLines={1}>
              {authors}
            </Text>
          )}
          {book.publisherName && (
            <Text variant="captionXs" numberOfLines={1}>
              {book.publisherName}
            </Text>
          )}
        </View>
        <Link href={`/catalog/${book.id}`} asChild>
          <Button
            icon={ArrowUpRight}
            variant="soft"
            className="-mr-2 -mt-2 bg-transparent"
          />
        </Link>
      </View>
      {tags.length > 0 && <ChipRow labels={tags} />}
    </Surface>
  );
}
