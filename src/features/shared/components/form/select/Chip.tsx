import { Dot } from "lucide-react-native";
import { Pressable } from "react-native";
import { cn, useTone } from "../../../theme";
import { Icon } from "../../base/Icon";
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
    "font-sans-regular",
    selected ? "text-dark2" : "text-white",
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-lg px-4 py-1.5 active:opacity-80",
        selected ? "bg-accent2" : "bg-dark2",
      )}
    >
      <Text className={textClass}>{label}</Text>
      {detail && (
        <>
          <Icon icon={Dot} tone={selected ? "dark1" : "dark3"} />
          <Text className={textClass}>{detail}</Text>
        </>
      )}
    </Pressable>
  );
}
