import type { BookListItem } from "@/features/catalog/internal/book/types";
import { View } from "react-native";
import BookList from "./bookList/BookList";

type Props = {
  list: { items: BookListItem[]; loading: boolean; loadMore: () => void };
};
export default function CatalogMain({ list }: Props) {
  return (
    <View className="flex-1 pt-7">
      <BookList
        books={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
      />
    </View>
  );
}
