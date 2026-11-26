import { useCanManageStock } from "@/features/inventory/ui/useCanManageStock";
import { STACK_OPTIONS } from "@/features/navigation/stackOptions";
import { Stack } from "expo-router";

export default function StockLayout() {
  const canManage = useCanManageStock();

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={canManage}>
        <Stack.Screen name="entry" />
        <Stack.Screen name="exit" />
      </Stack.Protected>
    </Stack>
  );
}
