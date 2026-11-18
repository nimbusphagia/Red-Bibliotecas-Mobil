import MovementDetail from "@/features/inventory/ui/MovementDetail";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function MovementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout>
      <MovementDetail id={id} />
    </MainLayout>
  );
}
