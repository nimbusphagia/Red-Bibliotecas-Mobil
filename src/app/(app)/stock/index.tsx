import MovementList from "@/features/inventory/ui/MovementList";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function StockScreen() {
  return (
    <MainLayout>
      <MovementList />
    </MainLayout>
  );
}
