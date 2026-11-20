import { LabelCodes } from "@/features/inventory/internal/label/types";
import { LabeledItem } from "@/features/shared/components";
import { View } from "react-native";
import { BookListItem } from "../../../internal/book/types";

type Props = {
  book: BookListItem;
  codes: LabelCodes | null;
};
export default function LabelInfo({ book, codes }: Props) {
  const writer = book.collaborators.find((c) => c.role === "writer");

  const rows = [
    { label: codes?.categoryCode, content: book.categoryName },
    {
      label: codes?.authorCode,
      content: writer?.lastName ?? writer?.firstName,
    },
    { content: book.subcategoryName, label: codes?.subcategoryCode },
    { content: book.title, label: codes?.titleCode },
  ];

  return (
    <View className="w-[230px] gap-2">
      {rows.map(({ label, content }, i) => (
        <LabeledItem
          key={i}
          label={label ?? "---"}
          content={content ?? "---"}
          labelClass="w-[28%] "
        />
      ))}
    </View>
  );
}
