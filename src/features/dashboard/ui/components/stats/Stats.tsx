import { useDashboardStats } from "@/features/dashboard/ui/useDashboardStats";
import { Card, DualCard, StatTile } from "@/features/shared/components";
import { cn, useTone } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Pressable, View } from "react-native";

const LOADING = "–";

export default function DashboardStats() {
  const stats = useDashboardStats();
  const t = useTone();

  return (
    <View
      className={cn("flex flex-row flex-wrap gap-4 border-b pb-8", t.divider)}
    >
      <Link href="/loans" asChild>
        <Pressable>
          <DualCard
            title="Préstamos"
            positiveStat={{
              name: "Al día",
              numberData: stats?.loans.onTime ?? LOADING,
            }}
            negativeStat={{
              name: "Vencidos",
              numberData: stats?.loans.overdue ?? LOADING,
            }}
          />
        </Pressable>
      </Link>
      <Link href="/labels" asChild>
        <Pressable>
          <DualCard
            title="Tejuelos"
            positiveStat={{
              name: "Impresos",
              numberData: stats?.labels.printed ?? LOADING,
            }}
            negativeStat={{
              name: "Faltantes",
              numberData: stats?.labels.pending ?? LOADING,
            }}
          />
        </Pressable>
      </Link>
      <Link href="/shelves" asChild>
        <Pressable>
          <Card title="Por ubicar" variant="flat">
            <View className="flex-row">
              <StatTile
                stat={{
                  name: "Ejemplares",
                  numberData: stats?.unplaced ?? LOADING,
                }}
              />
            </View>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
