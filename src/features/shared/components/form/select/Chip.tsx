import { Dot } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn, colors } from "../../../theme";
import { Text } from "../../base/Text";

export function Chip({
  label,
  detail,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  detail?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const textClass = cn(
    "font-semibold",
    selected ? "text-bg" : "text-secondary",
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-full px-4 py-1.5",
        selected ? "bg-primary" : "bg-fg1",
      )}
    >
      <Text className={textClass}>{label}</Text>
      {detail && (
        <>
          <Dot size={16} color={selected ? colors.bg : colors.secondary} />
          <Text className={textClass}>{detail}</Text>
        </>
      )}
    </Pressable>
  );
}
