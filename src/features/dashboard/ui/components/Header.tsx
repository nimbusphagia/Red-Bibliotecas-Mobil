import { useSession } from "@/features/account/internal/session";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";
import { Button, PageHeader } from "@/features/shared/components";
import { Link } from "expo-router";
import { ArrowDown, ArrowUp, PackagePlus } from "lucide-react-native";
import { View } from "react-native";

export default function DashboardHeader() {
  const session = useSession();
  const stock =
    session.status === "signed-in" && canManageStock(session.account.role);

  return (
    <PageHeader
      title="Inicio"
      subtitle="Gestiona tu biblioteca"
      lead={
        <>
          <View className="flex-row gap-2 items-center">
            <Link href="/loans/new" asChild>
              <Button title="Prestar" icon={ArrowUp} size="sm" weight="md" />
            </Link>
            <Link href="/loans" asChild>
              <Button title="Devolver" icon={ArrowDown} size="sm" weight="md" />
            </Link>
          </View>
          {stock && (
            <Link href="/stock/entry" asChild>
              <Button
                title="Ingresar"
                icon={PackagePlus}
                variant="soft"
                size="sm"
                weight="md"
              />
            </Link>
          )}
        </>
      }
    ></PageHeader>
  );
}
