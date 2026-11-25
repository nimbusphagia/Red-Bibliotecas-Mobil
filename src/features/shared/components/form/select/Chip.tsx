import { Dot, type LucideIcon } from "lucide-react-native";
import { Pressable } from "react-native";
import { accents, cn, useTone, type AccentLevel } from "../../../theme";
import { Icon } from "../../base/Icon";
import { Text } from "../../base/Text";

const shapes = {
  default: "rounded-lg px-4 py-1.5",
  pill: "h-7 rounded-full px-4",
  circle: "size-7 justify-center rounded-full",
};

export function Chip({
  label,
  detail,
  detailIcon,
  selected,
  disabled,
  onPress,
  shape = "default",
  accent,
}: {
  label: string;
  detail?: string;
  detailIcon?: LucideIcon;
  selected?: boolean;
  disabled?: boolean;
  /** Sin `onPress` el chip es solo informativo. */
  onPress?: () => void;
  shape?: keyof typeof shapes;
  accent?: AccentLevel;
}) {
  const t = useTone();
  const c = accent ? accents[accent] : t.chip[selected ? "selected" : "idle"];
  const compact = shape !== "default";
  const textClass = cn("font-sans-regular", compact && "text-[11px]", c.label);

  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      className={cn(
        "flex-row items-center active:opacity-80",
        shapes[shape],
        c.box,
      )}
    >
      <Text className={textClass} numberOfLines={compact ? 1 : undefined}>
        {label}
      </Text>
      {(detail || detailIcon) && <Icon icon={Dot} tone={c.dot} />}
      {detailIcon && <Icon icon={detailIcon} tone={c.icon} />}
      {detail && <Text className={textClass}>{detail}</Text>}
    </Pressable>
  );
}
