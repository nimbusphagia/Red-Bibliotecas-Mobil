import { useSession } from "@/features/account/internal/session";
import { Redirect } from "expo-router";

export default function Index() {
  const { status } = useSession();

  if (status === "setup") return <Redirect href="/register" />;
  if (status === "signed-out") return <Redirect href="/login" />;
  return <Redirect href="/dashboard" />;
}
