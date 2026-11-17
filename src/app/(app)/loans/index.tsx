import LoanList from "@/features/loans/ui/loans/LoanList";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function LoansScreen() {
  return (
    <MainLayout>
      <LoanList />
    </MainLayout>
  );
}
