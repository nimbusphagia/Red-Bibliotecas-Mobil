import type { Ref } from "react";
import type { TextInputInstance, TextInputProps } from "react-native";
import { TextInput, View } from "react-native";
import { cn, colors } from "../../theme/index";
import { Text } from "../Text";

type PillInputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  ref?: Ref<TextInputInstance>;
};

export function PillInput({
  label,
  error,
  helperText,
  containerClassName,
  className,
  editable,
  ref,
  ...rest
}: PillInputProps) {
  return (
    <View
      className={cn(
        "w-full gap-2",
        editable === false && "opacity-50",
        containerClassName,
      )}
    >
      <Text variant="h3">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        editable={editable}
        placeholderTextColor={colors.primary}
        className={cn(
          "h-12 rounded-full border bg-fg1 px-4 font-sans text-highlight",
          error ? "border-red-500" : "border-transparent",
          className,
        )}
        {...rest}
      />
      {error ? (
        <Text className="text-sm text-red-600">{error}</Text>
      ) : helperText ? (
        <Text variant="subtitle">{helperText}</Text>
      ) : null}
    </View>
  );
}
