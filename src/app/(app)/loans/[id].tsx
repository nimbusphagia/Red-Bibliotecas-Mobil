import { MainLayout } from "@/features/shared/layout/MainLayout";
import { useLocalSearchParams } from "expo-router";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <MainLayout title=""></MainLayout>;
}
