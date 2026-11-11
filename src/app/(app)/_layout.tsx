import { AppShell } from "@/shared/ui/layout/AppShell";
import { Slot } from "expo-router";

export default function AppLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
