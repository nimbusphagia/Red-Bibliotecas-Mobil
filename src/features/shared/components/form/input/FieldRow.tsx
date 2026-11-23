import { Pressable, View } from "react-native";
import { cn, status } from "../../../theme";
import { LabeledItem, type LabelWidth } from "../../list/LabeledItem";
import { FieldError } from "../FieldError";

type Props = {
  label: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  contentClass?: string;
  labelWidth?: LabelWidth;
};

export function FieldRow({
  label,
  value,
  onPress,
  disabled,
  error,
  className,
  contentClass,
  labelWidth = "form",
}: Props) {
  return (
    <View className="gap-1">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={cn(disabled && "opacity-80")}
      >
        <LabeledItem
          variant="input"
          label={label}
          content={value}
          labelWidth={labelWidth}
          className={cn(error && ["border", status.error.border], className)}
          contentClass={contentClass}
        />
      </Pressable>
      <FieldError>{error}</FieldError>
    </View>
  );
}
