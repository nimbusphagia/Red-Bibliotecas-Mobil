import CopyList from "@/features/inventory/ui/CopyList";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function CopiesScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();

  return (
    <Screen>
      <CopyList initialSearch={search} />
    </Screen>
  );
}
