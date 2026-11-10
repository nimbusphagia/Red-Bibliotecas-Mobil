import { Stack } from "expo-router";
import { useSession } from "@/features/account/session";

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
