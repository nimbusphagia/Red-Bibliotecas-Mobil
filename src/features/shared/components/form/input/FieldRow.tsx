import { Pressable, View } from "react-native";
import { cn } from "../../../theme";
import { LabeledItem } from "../../list/LabeledItem";
import { FieldError } from "../FieldError";

type Props = {
  label: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  contentClass?: string;
};

export function FieldRow({
  label,
  value,
  onPress,
  disabled,
  error,
  className,
  contentClass,
}: Props) {
  return (
    <View className="gap-1">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={cn(disabled && "opacity-50")}
      >
        <LabeledItem
          label={label}
          content={value}
          labelClass="w-[110px]"
          className={cn(error && "border border-red-500", className)}
          contentClass={contentClass}
        />
      </Pressable>
      <FieldError>{error}</FieldError>
    </View>
  );
}
