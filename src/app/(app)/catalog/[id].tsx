import { MainLayout } from "@/features/shared/ui/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <MainLayout title="Book detail">
      <Text>id: {id}</Text>
    </MainLayout>
  );
}
