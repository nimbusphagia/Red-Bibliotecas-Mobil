import { BookListItem } from "@/features/catalog/internal/book/types";
import Card from "@/features/shared/components/cards/Card";
import PairedRow from "@/features/shared/components/cards/PairedRow";
import { cn } from "@/features/shared/theme";
import { View } from "react-native";

type Props = {
  book: BookListItem;
};
export default function BookInfo({ book }: Props) {
  const namesBy = (role: BookListItem["collaborators"][number]["role"]) =>
    book.collaborators
      .filter((c) => c.role === role)
      .map((c) => [c.firstName, c.lastName].filter(Boolean).join(" "))
      .join(", ") || null;

  const columns = [
    [
      { label: "Escritor", content: namesBy("writer") },
      { label: "Ilustrador", content: namesBy("illustrator") },
      { label: "Traductor", content: namesBy("translator") },
      { label: "Serie", content: book.seriesName },
    ],
    [
      { label: "Editorial", content: book.publisherName },
      { label: "Colección", content: book.collectionName },
      { label: "Categoría", content: book.categoryName },
      { label: "Subcategoría", content: book.subcategoryName },
    ],
  ];

  return (
    <Card className="flex-1 rounded-[10] flex-row gap-5 items-start p-0 bg-bg">
      {columns.map((rows, i) => (
        <View key={i} className="flex-1 justify-start p-0 gap-2 bg-bg">
          {rows.map(({ label, content }) => (
            <PairedRow
              key={label}
              label={label}
              content={content ?? "---"}
              containerClass="rounded-lg border border-fg1 bg-bg"
              labelClass={cn(
                "font-sans-medium text-[16px] w-[30%] text-highlight pl-4 rounded-l-lg bg-fg2",
                content ? "bg-primary text-bg" : "",
              )}
              contentClass={cn(
                "flex-1 text-right font-sans-medium text-[16px] text-primary pr-4 rounded-r-lg bg-fg2",
                content ? "bg-fg1 " : "",
              )}
            />
          ))}
        </View>
      ))}
    </Card>
  );
}
