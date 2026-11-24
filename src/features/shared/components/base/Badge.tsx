import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { accents, cn, status, useTone, type AccentLevel } from "../../theme";
import { Icon, type IconTone } from "./Icon";
import { Text } from "./Text";

type Variant = "active" | "pending" | "finished";
type Props = {
  variant: Variant;
  text: string;
  className?: string;
};

export function StatusBadge({ text, variant, className }: Props) {
  const t = useTone();
  const variantClass = {
    active: status.success.text,
    pending: status.warning.text,
    finished: t.text,
  };
  return (
    <Text
      variant="itemSm"
      className={cn(
        "overflow-hidden rounded-lg px-3 py-1",
        variantClass[variant],
        className,
      )}
    >
      {text}
    </Text>
  );
}

type StatusIconProps = {
  icon: LucideIcon;
  accent?: AccentLevel;
  tone?: IconTone;
};

/** Ícono de estado: con `accent` va en un círculo del acento; sin él, solo el ícono (mismo tamaño). */
export function StatusIcon({ icon, accent, tone }: StatusIconProps) {
  const a = accent && accents[accent];
  return (
    <View
      className={cn("size-8 items-center justify-center rounded-full", a?.box)}
    >
      <Icon icon={icon} size="lg" stroke="sm" tone={tone ?? a?.icon} />
    </View>
  );
}

type StatusChipProps = {
  text: string;
  icon: LucideIcon;
  accent?: AccentLevel;
};

/** Ícono + texto en una píldora del acento; sin `accent`, como un chip sin seleccionar. */
export function StatusChip({ text, icon, accent }: StatusChipProps) {
  const t = useTone();
  const c = accent ? accents[accent] : t.chip.idle;
  return (
    <View
      className={cn("h-8 flex-row items-center gap-2 rounded-full px-3", c.box)}
    >
      <Icon icon={icon} size="lg" stroke="sm" tone={c.icon} />
      <Text variant="itemSm" className={c.label}>
        {text}
      </Text>
    </View>
  );
}

type IndicatorProps = {
  text: string;
  icon?: LucideIcon;
  accent?: AccentLevel;
};

export function StatusIndicator({ text, icon, accent }: IndicatorProps) {
  return (
    <View className="flex-row items-center gap-2">
      {icon && <StatusIcon icon={icon} accent={accent} />}
      <Text variant="item">{text}</Text>
    </View>
  );
}
