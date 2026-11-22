import { STACK_OPTIONS } from "@/features/navigation/stackOptions";
import { Stack } from "expo-router";

export default function ShelvesLayout() {
  return <Stack screenOptions={STACK_OPTIONS} />;
}
