import { Card, DualCard } from "@/features/shared/components";
import { View } from "react-native";

export default function DashboardStats() {
  const mock1 = {
    positive: {
      name: "Activos",
      numberData: 15,
    },
    negative: {
      name: "Vencidos",
      numberData: 2,
    },
  };
  const mock2 = {
    positive: {
      name: "Impresos",
      numberData: 250,
    },
    negative: {
      name: "Faltantes",
      numberData: 127,
    },
  };
  return (
    <View className="flex flex-row gap-8 pb-8 border-b border-fg1">
      <Card className="flex-1 h-[140]" title="Resumen Semanal"></Card>
      <View className="flex flex-row gap-5 self-start">
        <DualCard
          title="Préstamos"
          positiveStat={mock1.positive}
          negativeStat={mock1.negative}
        />
        <DualCard
          title="Tejuelos"
          positiveStat={mock2.positive}
          negativeStat={mock2.negative}
        />
      </View>
    </View>
  );
}
