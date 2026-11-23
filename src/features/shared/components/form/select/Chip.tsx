import { Dot, type LucideIcon } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn, useTone } from "../../../theme";
import { Icon } from "../../base/Icon";
import { Text } from "../../base/Text";

export function Chip({
  label,
  detail,
  detailIcon,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  detail?: string;
  detailIcon?: LucideIcon;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const c = useTone().chip[selected ? "selected" : "idle"];
  const textClass = cn("font-sans-regular", c.label);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-lg px-4 py-1.5 active:opacity-80",
        c.box,
      )}
    >
      <Text className={textClass}>{label}</Text>
      {(detail || detailIcon) && <Icon icon={Dot} tone={c.dot} />}
      {detailIcon && <Icon icon={detailIcon} tone={c.icon} />}
      {detail && <Text className={textClass}>{detail}</Text>}
    </Pressable>
  );
}
