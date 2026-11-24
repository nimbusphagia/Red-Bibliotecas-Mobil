import type { HeldStatus } from "@/features/dashboard/internal/types";
import { Panel, Surface, Text } from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { cn } from "@/features/shared/theme";
import { View } from "react-native";

// Escala lila solo para este gráfico (no está en la paleta).
const SEGMENTS: { status: HeldStatus; color: string }[] = [
  { status: "available", color: "bg-[#DBD3F5]" },
  { status: "on_loan", color: "bg-[#A099D1]" },
  { status: "damaged", color: "bg-[#6359A6]" },
];

export default function CollectionStatus({
  copies,
}: {
  copies: Record<HeldStatus, number>;
}) {
  const total = SEGMENTS.reduce((sum, s) => sum + copies[s.status], 0);
  const percent = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <Panel
      title="Ejemplares"
      titleClassName="text-[16px]"
      lead={<Text variant="itemSm">{total}</Text>}
      className="p-4"
    >
      <Surface inset className="h-4 flex-row overflow-hidden rounded-full">
        {SEGMENTS.map((s) => (
          <View
            key={s.status}
            className={s.color}
            style={{ flex: copies[s.status] }}
          />
        ))}
      </Surface>
      <View className="gap-1 pt-2">
        {SEGMENTS.map((s) => (
          <View key={s.status} className="flex-row items-center gap-2">
            <View className={cn("size-2.5 rounded-full", s.color)} />
            <Text variant="itemXs" className="flex-1">
              {COPY_STATUS_ES[s.status]}
            </Text>
            <Text variant="caption" className="text-[12px]">
              {percent(copies[s.status])}%
            </Text>
            <Text variant="itemSm" className="w-12 text-right text-[12px]">
              {copies[s.status]}
            </Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}
