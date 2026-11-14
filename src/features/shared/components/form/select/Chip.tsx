import { Pressable } from "react-native";
import { cn } from "../../../theme";
import { Text } from "../../base/Text";

export function Chip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "rounded-full px-4 py-1.5",
        selected ? "bg-primary" : "bg-fg1",
      )}
    >
      <Text
        className={cn("font-semibold", selected ? "text-bg" : "text-secondary")}
      >
        {label}
      </Text>
    </Pressable>
  );
}
