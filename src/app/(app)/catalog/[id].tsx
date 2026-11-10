import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/ui/layout/ScreenPlaceholder";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenPlaceholder title="Book detail">
      <Text>id: {id}</Text>
    </ScreenPlaceholder>
  );
}
