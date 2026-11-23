import type { HeldStatus } from "@/features/dashboard/internal/types";
import { Panel, Surface, Text } from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { cn, status } from "@/features/shared/theme";
import { View } from "react-native";

const SEGMENTS: { status: HeldStatus; color: string }[] = [
  { status: "available", color: status.success.bg },
  { status: "on_loan", color: status.info.bg },
  { status: "damaged", color: status.warning.bg },
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
            <Text variant="itemSm" className="text-[12px]">
              {copies[s.status]}
            </Text>
            <Text variant="caption" className="w-12 text-right text-[12px]">
              {percent(copies[s.status])}%
            </Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}
