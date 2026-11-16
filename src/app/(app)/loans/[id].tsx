import LoanDetail from "@/features/loans/ui/LoanDetail";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout>
      <LoanDetail id={id} />
    </MainLayout>
  );
}
