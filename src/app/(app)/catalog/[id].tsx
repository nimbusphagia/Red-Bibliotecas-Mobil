import BookDetail from "@/features/catalog/ui/BookDetail";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout>
      <BookDetail id={id} />
    </MainLayout>
  );
}
