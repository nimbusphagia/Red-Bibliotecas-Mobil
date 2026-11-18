import { useSession } from "@/features/account/internal/session";
import { Button, Text } from "@/features/shared/components";
import { MainLayout } from "@/features/shared/layout/MainLayout";
import { seedDev } from "@/util/testSeed";
import { useState } from "react";
import { View } from "react-native";

const ROLE_LABELS = {
  owner: "Propietario",
  admin: "Administrador",
  staff: "Bibliotecario",
} as const;

export default function AccountScreen() {
  const session = useSession();
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  if (session.status !== "signed-in") return null;

  const { account, signOut } = session;

  const runSeed = async () => {
    try {
      setSeedMsg("Cargando…");
      setSeedMsg(await seedDev(account.id));
    } catch (e) {
      setSeedMsg(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <MainLayout title="Account">
      <View className="gap-1">
        <Text className="text-lg font-semibold">{account.username}</Text>
        <Text>{ROLE_LABELS[account.role]}</Text>
      </View>
      <View className="mt-4 w-60">
        <Button title="Cerrar sesión" variant="secondary" onPress={signOut} />
      </View>
      {__DEV__ && (
        <View className="mt-4 w-60 gap-2">
          <Button title="Cargar datos de prueba" onPress={runSeed} />
          {seedMsg && <Text>{seedMsg}</Text>}
        </View>
      )}
    </MainLayout>
  );
}
