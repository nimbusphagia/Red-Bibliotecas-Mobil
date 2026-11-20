import VisitorDetail from "@/features/loans/ui/VisitorDetail";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function VisitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <VisitorDetail id={id} />
    </Screen>
  );
}
