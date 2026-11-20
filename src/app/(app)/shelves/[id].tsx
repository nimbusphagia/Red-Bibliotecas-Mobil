import ShelfDetail from "@/features/inventory/ui/ShelfDetail";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function ShelfDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <ShelfDetail id={id} />
    </Screen>
  );
}
