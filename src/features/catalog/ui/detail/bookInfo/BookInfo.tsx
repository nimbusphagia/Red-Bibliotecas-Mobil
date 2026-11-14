import { BookListItem } from "@/features/catalog/internal/book/types";
import { PairedRow } from "@/features/shared/components";
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
    <View className="flex-1 flex-row items-start gap-5">
      {columns.map((rows, i) => (
        <View key={i} className="flex-1 gap-2">
          {rows.map(({ label, content }) => (
            <PairedRow
              key={label}
              label={label}
              content={content}
              labelClass="w-[30%]"
            />
          ))}
        </View>
      ))}
    </View>
  );
}
