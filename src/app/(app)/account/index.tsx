import { View } from "react-native";
import { Button, Text } from "@/ui/components";
import { MainLayout } from "@/ui/layout/MainLayout";
import { useSession } from "@/features/account/session";

const ROLE_LABELS = {
  owner: "Propietario",
  admin: "Administrador",
  staff: "Bibliotecario",
} as const;

export default function AccountScreen() {
  const session = useSession();
  if (session.status !== "signed-in") return null;

  const { account, signOut } = session;

  return (
    <MainLayout title="Account">
      <View className="gap-1">
        <Text className="text-lg font-semibold">{account.username}</Text>
        <Text>{ROLE_LABELS[account.role]}</Text>
      </View>
      <View className="mt-4 w-60">
        <Button title="Cerrar sesión" variant="secondary" onPress={signOut} />
      </View>
    </MainLayout>
  );
}
