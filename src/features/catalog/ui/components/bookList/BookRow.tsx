import { View } from "react-native";
import { BookRow, Contributor } from "../../mock";
import { Button, Text } from "@/shared/ui/components";
import { cn, colors } from "@/shared/ui/utils";
import { BookUp, Dot, Eye } from "lucide-react-native";

type Props = {
  book: BookRow;
  index: number;
};
export default function BookRowComponent({ book, index }: Props) {
  const colClass = "flex-1 justify-center gap-1";
  const containerBg = "bg-foreground/20";
  const containerClass = `border border-foreground flex-row justify-between gap-5 py-4 px-7 rounded-full ${containerBg}`;
  return (
    <View className={containerClass}>
      <View className={colClass}>
        <Text variable="h3">{book.title}</Text>
        <View className="flex-row gap-1 items-center">
          {book.collection && (
            <>
              <Text variable="subtitle">"{book.collection}"</Text>
              <Dot color={colors.primary} />
            </>
          )}
          <Text variable="subtitle">{book.publisher}</Text>
        </View>
      </View>
      <View className={cn(colClass)}>
        <Text variable="h3" className="font-semibold text-[14px]">
          {formatContributors(book.contributors)}
        </Text>
        <Text variable="subtitle">{book.series ? `"${book.series}"` : ""}</Text>
      </View>

      <View className={cn(colClass, "items-center")}>
        <Text variable="h3" className="font-semibold text-[14px]">
          {book.shelf}
        </Text>
        <Text variable="subtitle" className="font-semibold ">
          {book.availableCount} de {book.copyCount}
        </Text>
      </View>
      <View className="flex-row gap-10">
        <Button
          variant="pill-secondary"
          lucideIcon=<Eye color={colors.highlight} />
        />
        <Button
          title="Prestar"
          variant="pill"
          lucideIcon=<BookUp color={colors.background} />
        />
      </View>
    </View>
  );
}
const formatContributors = (list: Contributor[]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};
