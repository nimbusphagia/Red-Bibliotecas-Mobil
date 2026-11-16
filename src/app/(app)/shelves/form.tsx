import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function BookFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return <MainLayout></MainLayout>;
}
