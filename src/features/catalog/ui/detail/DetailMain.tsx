import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/inventory/internal/label/types";
import { ScrollView, View } from "react-native";
import BookInfo from "./bookInfo/BookInfo";
import CopiesList from "./bookInfo/CopiesList";
import LabelInfo from "./bookInfo/LabelInfo";
import { Text } from "@/features/shared/components";
import { PropsWithChildren } from "react";
import { cn } from "@/features/shared/theme";

type Props = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
};
export default function DetailMain({ book, copies, codes }: Props) {
  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
      <View className="flex-row items-start pb-6 gap-6 border-b border-fg1">
        <DetailSection title="Tejuelo">
          <LabelInfo book={book} codes={codes} />
        </DetailSection>
        <View className="bg-fg1 w-[1px] h-full"></View>

        <DetailSection title="Detalles" expand={true}>
          <BookInfo book={book} />
        </DetailSection>
      </View>

      <DetailSection title="Ejemplares" expand={true}>
        <CopiesList copies={copies} />
      </DetailSection>
    </ScrollView>
  );
}

type SectionProps = { title: string; expand?: boolean; className?: string };
function DetailSection({
  title,
  expand,
  className = "",
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <View className={cn("h2 gap-2", expand ? "flex-1" : "", className)}>
      <Text variant="h2" className="text-highlight">
        {title}
      </Text>
      {children}
    </View>
  );
}
