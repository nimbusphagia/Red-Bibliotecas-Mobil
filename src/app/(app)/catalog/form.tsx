import BookForm from "@/features/catalog/ui/BookForm";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function BookFormScreen() {
  return (
    <MainLayout title="">
      <BookForm />
    </MainLayout>
  );
}
