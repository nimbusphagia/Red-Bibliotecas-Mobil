import LoanDetail from "@/features/loans/ui/LoanDetail";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <LoanDetail id={id} />
    </Screen>
  );
}
