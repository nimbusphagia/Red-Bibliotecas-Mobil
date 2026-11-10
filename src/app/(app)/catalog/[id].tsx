import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MainLayout } from "@/ui/layout/MainLayout";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout title="Book detail">
      <Text>id: {id}</Text>
    </MainLayout>
  );
}
