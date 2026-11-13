import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Button, Text } from "@/features/shared/components";
import { cn, colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookUp, Dot, Eye } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  book: BookListItem;
};
export default function BookRowComponent({ book }: Props) {
  const colClass = "flex-1 justify-center gap-[1px]";
  const containerBg = "bg-foreground/20";
  const containerClass = `border border-foreground flex-row justify-between gap-5 py-3 px-7 rounded-full ${containerBg}`;
  return (
    <View className={containerClass}>
      <View className={colClass}>
        <Text variant="h3">{book.title}</Text>
        <View className="flex-row  items-center">
          <Text variant="subtitle">{book.publisherName}</Text>
          {book.collectionName && (
            <>
              <Dot color={colors.primary} />
              <Text variant="subtitle">"{book.collectionName}"</Text>
            </>
          )}
        </View>
      </View>
      <View className={cn(colClass)}>
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
      <View className="flex-row items-center gap-10">
        <Link href={`/catalog/${book.id}`} asChild>
          <Button
            variant="pill-secondary"
            className="h-10 aspect-square"
            lucideIcon={<Eye size={16} color={colors.highlight} />}
          />
        </Link>
        <Button
          title="Prestar"
          className="h-10"
          variant="pill"
          lucideIcon={<BookUp size={16} color={colors.background} />}
        />
      </View>
    </View>
  );
}

const formatContributors = (list: BookListItem["collaborators"]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};
