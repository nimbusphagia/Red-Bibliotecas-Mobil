import { useCanManageStock } from "@/features/inventory/ui/useCanManageStock";
import { STACK_OPTIONS } from "@/features/navigation/stackOptions";
import { Stack } from "expo-router";

export default function ShelvesLayout() {
  const canManage = useCanManageStock();

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={canManage}>
        <Stack.Screen name="reorganize" />
      </Stack.Protected>
    </Stack>
  );
}
