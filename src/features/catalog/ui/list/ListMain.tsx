import type { BookListItem } from "@/features/catalog/internal/book/types";
import { View } from "react-native";
import Books from "./books/Books";

type Props = {
  list: { items: BookListItem[]; loading: boolean; loadMore: () => void };
};
export default function ListMain({ list }: Props) {
  return (
    <View className="flex-1 pt-2">
      <Books
        books={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
      />
    </View>
  );
}
