import { Slot } from "expo-router";
import { AppShell } from "@/ui/layout/AppShell";

export default function AppLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
