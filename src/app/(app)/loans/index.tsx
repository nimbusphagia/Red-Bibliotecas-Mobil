import LoanList from "@/features/loans/ui/LoanList";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function LoansScreen() {
  const { state } = useLocalSearchParams<{ state?: string }>();
  return (
    <Screen>
      <LoanList state={state} />
    </Screen>
  );
}
