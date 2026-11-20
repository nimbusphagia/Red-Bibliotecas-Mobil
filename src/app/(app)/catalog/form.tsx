import BookForm from "@/features/catalog/ui/BookForm";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function BookFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <Screen>
      <BookForm id={id} />
    </Screen>
  );
}
