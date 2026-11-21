import {
  SessionProvider,
  useSession,
} from "@/features/account/internal/session";
import {
  BootErrorScreen,
  LoadingScreen,
} from "@/features/shared/layout/LoadingScreen";
import { colors } from "@/features/shared/theme";
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

SplashScreen.preventAutoHideAsync();

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
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;
  if (session.status === "loading") return <LoadingScreen />;
  if (session.status === "error") {
    return <BootErrorScreen onRetry={session.retry} />;
  }

  const { status } = session;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === "setup" || status === "signed-out"}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signed-in"}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
