import type {
  DashboardSummary,
  LoanPreview,
} from "@/features/dashboard/internal/types";
import { Surface, Text } from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { CalendarClock, Flag, Stamp } from "lucide-react-native";
import { View } from "react-native";
import MetricCard from "./MetricCard";

const UP_TO_DATE = "Al día";

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Surface
      row
      className="flex-row items-center justify-between gap-2 px-3 py-1.5"
    >
      <Text variant="itemSm" numberOfLines={1} className="shrink">
        {label}
      </Text>
      <Text variant="caption">{value}</Text>
    </Surface>
  );
}

function LoanPreviews({ loans }: { loans: LoanPreview[] }) {
  if (loans.length === 0) return <Text variant="caption">{UP_TO_DATE}</Text>;
  return loans.map((l) => (
    <StatRow
      key={l.id}
      label={l.visitorName}
      value={formatDateES(l.expiresBy)}
    />
  ));
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
        href="/loans?state=overdue"
        className={card}
      >
        <LoanPreviews loans={s.oldestOverdue} />
      </MetricCard>
      <MetricCard
        title="Vencen pronto"
        icon={CalendarClock}
        value={s.dueSoon}
        href="/loans?state=open"
        className={card}
      >
        <LoanPreviews loans={s.nextDue} />
      </MetricCard>
      <MetricCard
        title="Tejuelos"
        icon={Stamp}
        href="/copies/mark"
        className={card}
      >
        <StatRow label="Sin etiquetar" value={s.unlabeled} />
        <StatRow label="Ejemplares etiquetados" value={s.labeled} />
      </MetricCard>
    </View>
  );
}
