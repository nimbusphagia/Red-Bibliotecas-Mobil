import LoanForm from "@/features/loans/ui/LoanForm";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function NewLoanScreen() {
  const { copyId } = useLocalSearchParams<{ copyId?: string }>();

  return (
    <Screen>
      <LoanForm copyId={copyId} />
    </Screen>
  );
}
