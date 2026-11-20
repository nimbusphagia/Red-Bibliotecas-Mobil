import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/inventory/internal/label/types";
import { Button, Section } from "@/features/shared/components";
import { Link } from "expo-router";
import { BookPlus, PencilLine, Tag } from "lucide-react-native";
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
      <View className="flex-row items-start pb-6 gap-6 border-b border-fg1">
        <Section
          title="Tejuelo"
          lead={
            <Button
              variant="secondary"
              className="bg-fg2 border-fg2 min-h-8"
              icon={Tag}
            />
          }
        >
          <LabelInfo book={book} codes={codes} />
        </Section>
        <View className="bg-fg1 w-[1px] h-full"></View>

        <Section
          title="Detalles"
          expand={true}
          lead={
            <Link
              href={{
                pathname: "/catalog/form",
                params: { id: String(book.id) },
              }}
              asChild
            >
              <Button variant="ghost" size="sm" icon={PencilLine} />
            </Link>
          }
        >
          <BookInfo book={book} />
        </Section>
      </View>

      <Section
        title="Ejemplares"
        expand={true}
        lead={<Button variant="ghost" icon={BookPlus} />}
      >
        <CopiesList copies={copies} />
      </Section>
    </ScrollView>
  );
}
