import type { Ref } from "react";
import { useState } from "react";
import type { TextInputInstance, TextInputProps } from "react-native";
import { Pressable, TextInput, View } from "react-native";
import { cn, colors, status, useTone } from "../../../theme";
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
  const t = useTone();

  return (
    <View className={cn("w-full gap-2", editable === false && "opacity-80")}>
      <Text variant="item">{label}</Text>
      <View className="justify-center">
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          editable={editable}
          placeholderTextColor={colors[t.placeholder]}
          secureTextEntry={secureTextEntry && !visible}
          className={cn(
            "h-12 rounded-lg border px-4 font-sans",
            t.inset,
            t.text,
            error ? status.error.border : ["border-transparent", t.accent.focus],
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
            <Text variant="itemSm" className={t.faint}>
              {visible ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        )}
      </View>
      <FieldError>{error}</FieldError>
      {!error && helperText ? (
        <Text variant="caption">{helperText}</Text>
      ) : null}
    </View>
  );
}
