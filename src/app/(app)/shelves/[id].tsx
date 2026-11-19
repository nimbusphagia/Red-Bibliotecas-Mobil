import ShelfDetail from "@/features/inventory/ui/ShelfDetail";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function ShelfDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout>
      <ShelfDetail id={id} />
    </MainLayout>
  );
}
