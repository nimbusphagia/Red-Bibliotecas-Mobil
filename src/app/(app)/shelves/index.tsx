import { ShelfList } from "@/features/inventory/ui/shelves/ShelfList";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function ShelvesScreen() {
  return (
    <MainLayout>
      <ShelfList />
    </MainLayout>
  );
}
