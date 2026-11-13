import { AppShell } from "@/features/shared/layout/AppShell";
import { Slot } from "expo-router";

export default function AppLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
