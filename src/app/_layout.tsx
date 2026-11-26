import {
  SessionProvider,
  useSession,
} from "@/features/account/internal/session";
import {
  BootErrorScreen,
  LoadingScreen,
} from "@/features/shared/layout/LoadingScreen";
import { STACK_OPTIONS } from "@/features/navigation/stackOptions";
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  useFonts,
} from "@expo-google-fonts/outfit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const session = useSession();
  const [loaded, error] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;
  if (session.status === "loading") return <LoadingScreen />;
  if (session.status === "error") {
    return <BootErrorScreen onRetry={session.retry} />;
  }

  const { status } = session;
  const pending =
    session.status === "signed-in" && session.account.mustChangePassword;

  return (
    <Stack screenOptions={STACK_OPTIONS}>
      <Stack.Screen name="index" />
      <Stack.Protected
        guard={status === "setup" || status === "signed-out" || pending}
      >
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signed-in" && !pending}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
