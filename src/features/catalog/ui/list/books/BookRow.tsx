import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Button, PillRow, Text } from "@/features/shared/components";
import { cn, colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookUp, Dot, Eye } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  book: BookListItem;
};
export default function BookRow({ book }: Props) {
  const colClass = "flex-1 justify-center gap-[1px]";
  return (
    <PillRow>
      <View className={colClass}>
        <Text variant="h3" className="text-highlight">
          {book.title}
        </Text>
        <View className="flex-row  items-center">
          <Text variant="subtitle">{book.publisherName}</Text>
          {book.collectionName && (
            <>
              <Dot color={colors.secondary} />
              <Text variant="subtitle">"{book.collectionName}"</Text>
            </>
          )}
        </View>
      </View>
      <View className={colClass}>
        <Text variant="h3" className="font-semibold text-[15px]">
          {formatContributors(book.collaborators)}
        </Text>
        <Text variant="subtitle">
          {book.seriesName ? `"${book.seriesName}"` : ""}
        </Text>
      </View>

      <View className={cn(colClass, "items-center")}>
        <Text variant="h3" className="font-semibold text-[14px]">
          {book.availableCount} de {book.activeCount}
        </Text>
        <Text variant="subtitle" className="font-semibold">
          {book.onLoanCount} prestados
        </Text>
      </View>
      <View className="flex-row items-center gap-6">
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
      </View>
    </PillRow>
  );
}

const formatContributors = (list: BookListItem["collaborators"]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};
