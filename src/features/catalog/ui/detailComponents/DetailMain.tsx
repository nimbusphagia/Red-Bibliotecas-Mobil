import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/inventory/internal/label/types";
import { ScrollView, View } from "react-native";
import BookInfo from "./bookInfo/BookInfo";
import CopiesList from "./bookInfo/CopiesList";
import LabelInfo from "./bookInfo/LabelInfo";

type Props = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
};
export default function DetailMain({ book, copies, codes }: Props) {
  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
      <View className="flex-row items-start pb-6 gap-6 border-b border-foreground">
        <BookInfo book={book} />
        <View className="bg-foreground w-[1px] h-full"></View>
        <LabelInfo book={book} codes={codes} />
      </View>

      <View className="flex-row items-start gap-6">
        <CopiesList copies={copies} />
      </View>
    </ScrollView>
  );
}
