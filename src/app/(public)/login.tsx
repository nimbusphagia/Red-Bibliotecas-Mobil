import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ScreenPlaceholder title="Login">
      <Pressable onPress={() => router.replace("/dashboard")}>
        <Text>Enter app</Text>
      </Pressable>
    </ScreenPlaceholder>
  );
}
