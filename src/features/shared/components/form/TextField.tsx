import type { Ref } from "react";
import { useState } from "react";
import type { TextInputInstance, TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";
import { cn, colors } from "../../theme/index";
import { Text } from "../Text";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  ref?: Ref<TextInputInstance>;
};

export function TextField({
  label,
  error,
  helperText,
  containerClassName,
  className,
  secureTextEntry,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPassword = !!secureTextEntry;

  const handleFocus: TextInputProps["onFocus"] = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: TextInputProps["onBlur"] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View className={cn("w-full", containerClassName)}>
      <Text className="mb-1.5 text-sm font-medium text-slate-700">{label}</Text>

      <View className="justify-center">
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={isPassword && !passwordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "min-h-12 rounded-lg border bg-white px-4 text-base text-slate-900",
            error
              ? "border-red-500"
              : focused
                ? "border-blue-600"
                : "border-slate-300",
            isPassword && "pr-16",
            className,
          )}
          {...rest}
        />

        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            onPress={() => setPasswordVisible((v) => !v)}
            hitSlop={8}
            className="absolute right-3 px-1 py-2"
          >
            <Text className="text-sm font-medium text-blue-600">
              {passwordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>

      {error ? (
        <Text className="mt-1 text-sm text-red-600">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-sm text-slate-500">{helperText}</Text>
      ) : null}
    </View>
  );
}
