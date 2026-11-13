import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function ShelfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MainLayout title={`Shelf ${id}`} />;
}
