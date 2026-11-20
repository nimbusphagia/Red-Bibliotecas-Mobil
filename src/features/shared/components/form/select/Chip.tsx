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
  const textClass = cn("font-sans-medium", selected ? "text-bg" : "text-dark2");

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-full px-4 py-1.5",
        selected ? "bg-dark2" : "bg-bg",
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
