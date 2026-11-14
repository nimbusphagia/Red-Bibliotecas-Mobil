import { Pressable, View } from "react-native";
import { PairedRow } from "../../list/PairedRow";
import { FieldError } from "../FieldError";

type Props = {
  label: string;
  value: string | null;
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
      <Pressable onPress={onPress} disabled={disabled}>
        <PairedRow
          label={label}
          content={value}
          error={!!error}
          disabled={disabled}
          className={className}
          contentClass={contentClass}
        />
      </Pressable>
      <FieldError>{error}</FieldError>
    </View>
  );
}
