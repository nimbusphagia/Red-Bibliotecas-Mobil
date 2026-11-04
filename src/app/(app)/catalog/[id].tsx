import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenPlaceholder title="Book detail">
      <Text>id: {id}</Text>
    </ScreenPlaceholder>
  );
}
