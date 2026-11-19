import { colors } from "@/features/shared/theme";
import { Stack } from "expo-router";

export default function LabelsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
