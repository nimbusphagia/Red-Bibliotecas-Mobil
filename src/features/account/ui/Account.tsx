import { useSession } from "@/features/account/internal/session";
import {
  Button,
  DetailColumns,
  PageHeader,
  Panel,
  Text,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { ACCOUNT_ROLE_ES } from "@/features/shared/format/translate";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { seedDev } from "@/util/testSeed";
import { KeyRound, LogOut } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import ChangePasswordDialog from "./components/ChangePasswordDialog";

export default function Account() {
  const session = useSession();
  const [changing, setChanging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
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
    <>
      <PageHeader
        title="Cuenta"
        subtitle="Tu sesión y datos de acceso"
        lead={
          <Button
            title="Cerrar sesión"
            icon={LogOut}
            variant="soft"
            size="sm"
            weight="md"
            onPress={signOut}
          />
        }
      />
      <ScreenBody>
        <DetailColumns
          columns={[
            {
              title: "Datos",
              rows: [
                { label: "Usuario", content: account.username },
                { label: "Rol", content: ACCOUNT_ROLE_ES[account.role] },
                {
                  label: "Miembro desde",
                  content: formatDateES(account.createdAt, true),
                },
              ],
            },
            {
              title: "Seguridad",
              lead: (
                <Button
                  title="Cambiar"
                  icon={KeyRound}
                  size="sm"
                  onPress={() => {
                    setNotice(null);
                    setChanging(true);
                  }}
                />
              ),
              rows: [{ label: "Contraseña", content: "••••••••" }],
            },
          ]}
        />
        {notice && <Text variant="caption">{notice}</Text>}
        {__DEV__ && (
          <Panel title="Desarrollo">
            <View className="w-60 gap-2">
              <Button title="Cargar datos de prueba" onPress={runSeed} />
              {seedMsg && <Text>{seedMsg}</Text>}
            </View>
          </Panel>
        )}
      </ScreenBody>
      {changing && (
        <ChangePasswordDialog
          onClose={() => setChanging(false)}
          onChanged={() => {
            setChanging(false);
            setNotice("Contraseña actualizada");
          }}
        />
      )}
    </>
  );
}
