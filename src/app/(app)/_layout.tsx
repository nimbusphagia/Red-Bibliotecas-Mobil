import { AppShell } from "@/features/shared/ui/layout/AppShell";
import { Slot } from "expo-router";

export default function AppLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
