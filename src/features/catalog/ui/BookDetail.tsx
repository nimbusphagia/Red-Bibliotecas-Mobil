import type { BookListItem } from "@/features/catalog/internal/book/types";
import { getBookItem } from "@/features/catalog/internal/book/service";
import { listCopiesByBook } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import DetailHeader from "./detail/DetailHeader";
import DetailMain from "./detail/DetailMain";
import { getBookLabelCodes } from "@/features/inventory/internal/label/service";
import { LabelCodes } from "@/features/inventory/internal/label/types";

type Props = {
  id: string;
};
type Data = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
};

export default function BookDetail({ id }: Props) {
  const [data, setData] = useState<Data | null>(null);

  useFocusEffect(
    useCallback(() => {
      const bookId = routeIdSchema.parse(id);
      let cancelled = false;
      Promise.all([
        getBookItem(bookId),
        listCopiesByBook({ bookId, excludeReleased: true, limit: 100 }),
        getBookLabelCodes(bookId),
      ]).then(([book, page, codes]) => {
        if (!cancelled) setData({ book, copies: page.items, codes });
      });
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  if (!data) return <ActivityIndicator />;

  return (
    <>
      <DetailHeader id={data.book.id} title={data.book.title} />
      <DetailMain book={data.book} copies={data.copies} codes={data.codes} />
    </>
  );
}
