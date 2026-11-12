import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Text } from "@/shared/ui/components";
import { ActivityIndicator, FlatList } from "react-native";
import BookRowComponent from "./BookRow";

type Props = {
  books: BookListItem[];
  loading: boolean;
  onEndReached: () => void;
};
export default function BookList({ books, loading, onEndReached }: Props) {
  return (
    <FlatList
      data={books}
      keyExtractor={(b) => String(b.id)}
      renderItem={({ item }) => <BookRowComponent book={item} />}
      contentContainerStyle={{
        gap: 20,
        paddingTop: 0,
        paddingBottom: 40,
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : undefined}
      ListEmptyComponent={
        loading ? undefined : <Text variable="subtitle">Sin resultados</Text>
      }
    />
  );
}
