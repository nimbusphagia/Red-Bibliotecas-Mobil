import { BookListItem } from "@/features/catalog/internal/book/types";
import { LabeledItem } from "@/features/shared/components";
import { View } from "react-native";

type Props = {
  book: BookListItem;
};
export default function BookInfo({ book }: Props) {
  const namesBy = (role: BookListItem["collaborators"][number]["role"]) =>
    book.collaborators
      .filter((c) => c.role === role)
      .map((c) => [c.firstName, c.lastName].filter(Boolean).join(" "))
      .join(", ");

  const columns = [
    [
      { label: "Escritor", content: namesBy("writer") },
      { label: "Ilustrador", content: namesBy("illustrator") },
      { label: "Traductor", content: namesBy("translator") },
      { label: "Editorial", content: book.publisherName ?? undefined },
    ],
    [
      { label: "Colección", content: book.collectionName ?? undefined },
      { label: "Serie", content: book.seriesName ?? undefined },
      { label: "Categoría", content: book.categoryName ?? undefined },
      { label: "Subcategoría", content: book.subcategoryName ?? undefined },
    ],
  ];

  return (
    <View className="flex-1 flex-row items-start gap-2">
      {columns.map((rows, i) => (
        <View key={i} className="flex-1 gap-2">
          {rows.map(({ label, content }) => (
            <LabeledItem
              key={label}
              label={label}
              content={content}
              labelWidth="narrow"
            />
          ))}
        </View>
      ))}
    </View>
  );
}
