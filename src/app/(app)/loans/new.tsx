import LoanForm from "@/features/loans/ui/LoanForm";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function NewLoanScreen() {
  const { copyId } = useLocalSearchParams<{ copyId?: string }>();

  return (
    <MainLayout>
      <LoanForm copyId={copyId} />
    </MainLayout>
  );
}
