import VisitorDetail from "@/features/loans/ui/VisitorDetail";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function VisitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout>
      <VisitorDetail id={id} />
    </MainLayout>
  );
}
