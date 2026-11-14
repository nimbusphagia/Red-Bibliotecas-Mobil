import BookList from "@/features/catalog/ui/BookList";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function CatalogScreen() {
  return (
    <MainLayout>
      <BookList />
    </MainLayout>
  );
}
