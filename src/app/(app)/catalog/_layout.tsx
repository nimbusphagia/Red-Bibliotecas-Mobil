import { colors } from "@/features/shared/ui/utils";
import { Stack } from "expo-router";

export default function CatalogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
