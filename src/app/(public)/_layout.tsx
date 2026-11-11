import { useSession } from "@/features/account/internal/session";
import { Stack } from "expo-router";

export default function PublicLayout() {
  const { status } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === "setup"}>
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signed-out"}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}
