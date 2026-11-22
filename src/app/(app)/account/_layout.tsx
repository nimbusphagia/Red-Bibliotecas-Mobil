import { STACK_OPTIONS } from "@/features/navigation/stackOptions";
import { Stack } from "expo-router";

export default function AccountLayout() {
  return <Stack screenOptions={STACK_OPTIONS} />;
}
