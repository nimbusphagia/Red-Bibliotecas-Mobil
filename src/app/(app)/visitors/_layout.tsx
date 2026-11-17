import { colors } from "@/features/shared/theme";
import { Stack } from "expo-router";

export default function VisitorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
