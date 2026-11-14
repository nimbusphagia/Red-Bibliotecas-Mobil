import { LabelCodes } from "@/features/inventory/internal/label/types";
import { PairedRow } from "@/features/shared/components";
import { View } from "react-native";
import { BookListItem } from "../../../internal/book/types";

type Props = {
  book: BookListItem;
  codes: LabelCodes | null;
};
export default function LabelInfo({ book, codes }: Props) {
  const writer = book.collaborators.find((c) => c.role === "writer");

  const rows = [
    { content: book.categoryName, label: codes?.categoryCode ?? "---" },
    {
      content: writer?.lastName ?? writer?.firstName ?? null,
      label: codes?.authorCode ?? "---",
    },
    { content: book.subcategoryName, label: codes?.subcategoryCode ?? "---" },
    { content: book.title, label: codes?.titleCode ?? "---" },
  ];

  return (
    <View className="w-[230px] gap-2">
      {rows.map(({ label, content }, i) => (
        <PairedRow key={i} variant="code" label={label} content={content} />
      ))}
    </View>
  );
}
