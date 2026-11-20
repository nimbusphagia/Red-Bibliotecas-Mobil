import BookDetail from "@/features/catalog/ui/BookDetail";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <BookDetail id={id} />
    </Screen>
  );
}
