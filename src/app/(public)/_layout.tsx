import { useSession } from "@/features/account/internal/session";
import { STACK_OPTIONS } from "@/features/navigation/stackOptions";
import { Stack } from "expo-router";

export default function PublicLayout() {
  const session = useSession();
  const { status } = session;

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Protected guard={status === "setup"}>
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signed-out"}>
        <Stack.Screen name="login" />
        <Stack.Screen name="recover" />
      </Stack.Protected>
      <Stack.Protected
        guard={status === "signed-in" && session.account.mustChangePassword}
      >
        <Stack.Screen name="new-password" />
      </Stack.Protected>
    </Stack>
  );
}
