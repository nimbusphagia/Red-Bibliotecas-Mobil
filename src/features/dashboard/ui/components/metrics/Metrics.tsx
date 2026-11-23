import type { DashboardSummary } from "@/features/dashboard/internal/types";
import { Text } from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { CalendarClock, Flag, Stamp, Tag } from "lucide-react-native";
import { View } from "react-native";
import MetricCard from "./MetricCard";

const UP_TO_DATE = "Al día";

function Caption({ n, text }: { n: number; text: string }) {
  return (
    <Text variant="caption" className="text-[13px]">
      {n > 0 ? text : UP_TO_DATE}
    </Text>
  );
}

export default function Metrics({ summary: s }: { summary: DashboardSummary }) {
  const { isExpanded } = useLayoutMode();
  const card = cn(!isExpanded && "min-w-[30%] flex-1");

  return (
    <View className={cn("gap-4", !isExpanded && "flex-row flex-wrap")}>
      <MetricCard
        title="Vencidos"
        icon={Flag}
        value={s.overdue}
        href="/loans"
        className={card}
      >
        {s.oldestOverdue.length === 0 ? (
          <Text variant="caption">{UP_TO_DATE}</Text>
        ) : (
          s.oldestOverdue.map((l) => (
            <View key={l.id} className="flex-row gap-2">
              <Text variant="itemSm" numberOfLines={1} className="flex-1">
                {l.visitorName}
              </Text>
              <Text variant="caption">{formatDateES(l.expiresBy)}</Text>
            </View>
          ))
        )}
      </MetricCard>
      <MetricCard
        title="Vencen pronto"
        icon={CalendarClock}
        value={s.dueSoon}
        href="/loans"
        className={card}
      >
        <Caption n={s.dueSoon} text="En los próximos 7 días" />
      </MetricCard>
      <MetricCard
        title="Sin tejuelo"
        icon={Stamp}
        value={s.unlabeled}
        href="/copies/mark"
        className={card}
      >
        <Caption n={s.unlabeled} text="Ejemplares por etiquetar" />
      </MetricCard>
    </View>
  );
}
