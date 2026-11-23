import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { cn, status, useTone } from "../../theme";
import { Icon } from "./Icon";
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

type IndicatorProps = { text: string; icon?: LucideIcon };

export function StatusIndicator({ text, icon }: IndicatorProps) {
  return (
    <View className="flex-row items-center gap-2">
      {icon && <Icon icon={icon} size="lg" />}
      <Text variant="item">{text}</Text>
    </View>
  );
}
