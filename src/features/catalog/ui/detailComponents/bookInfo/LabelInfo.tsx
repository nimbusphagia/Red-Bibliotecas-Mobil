import { LabelCodes } from "@/features/inventory/internal/label/types";
import { Card, PairedRow } from "@/features/shared/components";
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
      content: writer?.lastName ?? writer?.firstName ?? "---",
      label: codes?.authorCode ?? "---",
    },
    { content: book.subcategoryName, label: codes?.subcategoryCode ?? "---" },
    { content: book.title, label: codes?.titleCode ?? "---" },
  ];

  return (
    <View className="w-[230px] gap-2">
      <Card className="p-0 rounded-[10] justify-between flex-1 bg-bg">
        {rows.map(({ label, content }) => (
          <PairedRow
            key={content}
            label={label}
            content={content}
            highlight="label"
            containerClass="w-full rounded-lg gap-2 rounded-lg"
            labelClass="w-[60] text-center font-sans-bold rounded-lg"
            contentClass="flex-1 px-4 truncate text-[16px] font-sans-medium bg-fg2 text-primary rounded-lg border border-fg1"
          />
        ))}
      </Card>
    </View>
  );
}
