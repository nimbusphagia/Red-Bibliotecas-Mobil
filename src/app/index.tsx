import { Redirect } from "expo-router";
import { useSession } from "@/features/account/session";

export default function Index() {
  const { status } = useSession();

  if (status === "setup") return <Redirect href="/register" />;
  if (status === "signed-out") return <Redirect href="/login" />;
  return <Redirect href="/dashboard" />;
}
