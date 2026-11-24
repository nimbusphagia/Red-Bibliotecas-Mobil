import type {
  DashboardSummary,
  LoanPreview,
} from "@/features/dashboard/internal/types";
import { LABEL_STATE_ICON } from "@/features/inventory/ui/labels/labelState";
import { Icon, Surface, Text } from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import {
  CalendarClock,
  Flag,
  Stamp,
  type LucideIcon,
} from "lucide-react-native";
import MetricCard from "./MetricCard";

const UP_TO_DATE = "Al día";

type StatRowProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
};

function StatRow({ label, value, icon }: StatRowProps) {
  return (
    <Surface
      row
      className="flex-row items-center justify-between gap-2 px-3 py-1.5"
    >
      {icon && <Icon icon={icon} size="sm" />}
      <Text variant="itemSm" numberOfLines={1} className="flex-1">
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

type Props = { summary: DashboardSummary; className?: string };

export function DueMetrics({ summary: s, className }: Props) {
  return (
    <>
      <MetricCard
        title="Vencidos"
        icon={Flag}
        value={s.overdue}
        href="/loans?state=overdue"
        className={className}
      >
        <LoanPreviews loans={s.oldestOverdue} />
      </MetricCard>
      <MetricCard
        title="Vencen pronto"
        icon={CalendarClock}
        value={s.dueSoon}
        href="/loans?state=open"
        className={className}
      >
        <LoanPreviews loans={s.nextDue} />
      </MetricCard>
    </>
  );
}

export function LabelMetrics({ summary: s, className }: Props) {
  return (
    <MetricCard
      title="Tejuelos"
      icon={Stamp}
      href="/copies/mark"
      className={className}
    >
      <StatRow
        label="Necesitan actualizarse"
        value={s.outdated}
        icon={LABEL_STATE_ICON.outdated}
      />
      <StatRow
        label="Sin etiquetar"
        value={s.unlabeled}
        icon={LABEL_STATE_ICON.pending}
      />
      <StatRow
        label="Ejemplares etiquetados"
        value={s.labeled}
        icon={LABEL_STATE_ICON.labeled}
      />
    </MetricCard>
  );
}
