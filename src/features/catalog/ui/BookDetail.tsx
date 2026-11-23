import {
  getBookItem,
  getBookLabelCodes,
} from "@/features/catalog/internal/book/service";
import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { PageHeader } from "@/features/shared/components";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import DetailMain from "./detail/DetailMain";
import type {
  BookListItem,
  LabelCodes,
} from "@/features/catalog/internal/book/types";
import { formatContributors } from "@/features/shared/format/text";

type Props = {
  id: string;
};
type Data = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
};

const fetchData = async (bookId: number): Promise<Data> => {
  const [book, page, codes] = await Promise.all([
    getBookItem(bookId),
    listCopies({ bookId, excludeReleased: true, limit: 100 }),
    getBookLabelCodes(bookId),
  ]);
  return { book, copies: page.items, codes };
};

export default function BookDetail({ id }: Props) {
  const [data, setData] = useState<Data | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchData(routeIdSchema.parse(id)).then((d) => {
        if (!cancelled) setData(d);
      });
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  const reload = () => fetchData(routeIdSchema.parse(id)).then(setData);

  if (!data) return <ActivityIndicator />;

  return (
    <>
      <PageHeader
        title={data.book.title}
        subtitle={formatContributors(data.book.collaborators)}
      />
      <DetailMain
        book={data.book}
        copies={data.copies}
        codes={data.codes}
        onCopiesAdded={reload}
      />
    </>
  );
}
