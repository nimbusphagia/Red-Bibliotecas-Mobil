import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/inventory/internal/label/types";
import { ScrollView, View } from "react-native";
import BookInfo from "./bookInfo/BookInfo";
import CopiesList from "./bookInfo/CopiesList";
import LabelInfo from "./bookInfo/LabelInfo";
import { Button } from "@/features/shared/components";
import { Section } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookPlus, PencilLine, Tag } from "lucide-react-native";

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
              className="min-h-8 "
              icon={<Tag size={14} strokeWidth={2.5} color={colors.primary} />}
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
              <Button
                variant="secondary"
                className="min-h-8"
                icon={
                  <PencilLine
                    size={14}
                    strokeWidth={2.5}
                    color={colors.primary}
                  />
                }
              />
            </Link>
          }
        >
          <BookInfo book={book} />
        </Section>
      </View>

      <Section
        title="Ejemplares"
        expand={true}
        lead={
          <Button
            variant="secondary"
            className="min-h-8"
            icon={
              <BookPlus size={15} strokeWidth={2.5} color={colors.primary} />
            }
          />
        }
      >
        <CopiesList copies={copies} />
      </Section>
    </ScrollView>
  );
}
