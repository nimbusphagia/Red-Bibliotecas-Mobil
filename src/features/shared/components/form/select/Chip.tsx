import { Dot } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn } from "../../../theme";
import { Text } from "../../base/Text";
import { Icon } from "../../base/Icon";

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
    "font-sans-medium",
    selected ? "text-dark1" : "text-white",
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-full px-4 py-1.5",
        selected ? "bg-accent2" : "bg-dark2",
      )}
    >
      <Text className={textClass}>{label}</Text>
      {detail && (
        <>
          <Icon icon={Dot} tone={selected ? "bg" : "secondary"} />
          <Text className={textClass}>{detail}</Text>
        </>
      )}
    </Pressable>
  );
}
