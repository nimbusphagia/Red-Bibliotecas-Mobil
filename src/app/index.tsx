import { useSession } from "@/features/account/internal/session";
import { Redirect } from "expo-router";

export default function Index() {
  const session = useSession();

  if (session.status === "setup") return <Redirect href="/register" />;
  if (session.status === "signed-out") return <Redirect href="/login" />;
  if (session.status === "signed-in" && session.account.mustChangePassword) {
    return <Redirect href="/new-password" />;
  }
  return <Redirect href="/dashboard" />;
}
