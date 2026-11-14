import type { BookListItem } from "@/features/catalog/internal/book/types";
import { Text } from "@/features/shared/components";
import { ActivityIndicator, FlatList } from "react-native";
import BookRow from "./BookRow";

type Props = {
  books: BookListItem[];
  loading: boolean;
  onEndReached: () => void;
};
export default function Books({ books, loading, onEndReached }: Props) {
  return (
    <FlatList
      data={books}
      keyExtractor={(b) => String(b.id)}
      renderItem={({ item }) => <BookRow book={item} />}
      contentContainerStyle={{
        gap: 16,
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : undefined}
      ListEmptyComponent={
        loading ? undefined : <Text variant="subtitle">Sin resultados</Text>
      }
    />
  );
}
