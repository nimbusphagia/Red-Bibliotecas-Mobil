import LabelForm from "@/features/inventory/ui/LabelForm";
import { Screen } from "@/features/shared/layout/Screen";
import { useLocalSearchParams } from "expo-router";

export default function MarkLabelsScreen() {
  const { copyId } = useLocalSearchParams<{ copyId?: string }>();

  return (
    <Screen>
      <LabelForm copyId={copyId} />
    </Screen>
  );
}
