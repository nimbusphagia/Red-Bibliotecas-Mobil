import type { Ref } from "react";
import { useState } from "react";
import type { TextInputInstance, TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";
import { cn, colors } from "../../../theme";
import { Text } from "../../base/Text";
import { FieldError } from "../FieldError";

type Props = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  ref?: Ref<TextInputInstance>;
};

export function TextField({
  label,
  error,
  helperText,
  className,
  secureTextEntry,
  editable,
  ref,
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View className={cn("w-full gap-2", editable === false && "opacity-50")}>
      <Text variant="h3">{label}</Text>
      <View className="justify-center">
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          editable={editable}
          placeholderTextColor={colors.primary}
          secureTextEntry={secureTextEntry && !visible}
          className={cn(
            "h-12 rounded-full border bg-fg1 px-4 font-sans text-highlight",
            error ? "border-red-500" : "border-transparent focus:border-fg1",
            secureTextEntry && "pr-24",
            className,
          )}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            className="absolute right-4 px-1 py-2"
          >
            <Text className="font-sans-medium text-sm text-highlight">
              {visible ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        )}
      </View>
      <FieldError>{error}</FieldError>
      {!error && helperText ? (
        <Text variant="subtitle">{helperText}</Text>
      ) : null}
    </View>
  );
}
