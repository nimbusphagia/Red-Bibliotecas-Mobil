import { Pressable, View } from "react-native";
import { cn } from "../../../theme/index";
import { Text } from "../../base/Text";
import { PairedRow } from "../../list/PairedRow";

type Props = {
  label: string;
  value: string | null;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
  containerClass?: string;
  labelClass?: string;
  contentClass?: string;
};

export function FieldRow({
  label,
  value,
  onPress,
  disabled,
  error,
  containerClass = "",
  labelClass = "",
  contentClass = "",
}: Props) {
  const disabledClass = "bg-fg1/60 text-primary/70";
  return (
    <View className="gap-1">
      <Pressable onPress={onPress} disabled={disabled}>
        <PairedRow
          label={label}
          content={value ?? "---"}
          containerClass={cn(
            "rounded-lg border",
            value && "border-0",
            error ? "border-red-500" : "border-fg1",
            containerClass,
          )}
          labelClass={cn(
            "font-sans-medium text-[16px] w-[120px] text-highlight pl-4 rounded-l-lg bg-fg2",
            value && "bg-primary text-bg",
            labelClass,
            disabled && disabledClass,
          )}
          contentClass={cn(
            "flex-1 text-right font-sans-medium text-[16px] text-primary pr-4 rounded-r-lg bg-fg2",
            value && "bg-fg1",
            contentClass,
            disabled && disabledClass,
          )}
        />
      </Pressable>
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
