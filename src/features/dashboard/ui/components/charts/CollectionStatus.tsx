import type { HeldStatus } from "@/features/dashboard/internal/types";
import { Panel, Surface, Text } from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { cn } from "@/features/shared/theme";
import { View } from "react-native";

const SEGMENTS: { status: HeldStatus; color: string }[] = [
  { status: "available", color: "bg-accentMd" },
  { status: "on_loan", color: "bg-accentLg" },
  { status: "damaged", color: "bg-accentNeg" },
];

export default function CollectionStatus({
  copies,
  className,
}: {
  copies: Record<HeldStatus, number>;
  className?: string;
}) {
  const total = SEGMENTS.reduce((sum, s) => sum + copies[s.status], 0);
  const percent = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <Panel
      title="Ejemplares"
      titleClassName="text-[15px]"
      lead={<Text variant="itemSm">{total}</Text>}
      className={cn("p-4", className)}
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
            <Text variant="caption" className="text-[11px]">
              {percent(copies[s.status])}%
            </Text>
            <Text variant="itemSm" className="w-12 text-right text-[11px]">
              {copies[s.status]}
            </Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}
