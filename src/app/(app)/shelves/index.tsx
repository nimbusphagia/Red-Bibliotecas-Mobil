import ShelfList from "@/features/inventory/ui/ShelfList";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function ShelvesScreen() {
  return (
    <MainLayout>
      <ShelfList />
    </MainLayout>
  );
}
