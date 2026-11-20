import MovementDetail from "@/features/inventory/ui/MovementDetail";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "@/features/shared/layout/Screen";

export default function MovementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <MovementDetail id={id} />
    </Screen>
  );
}
