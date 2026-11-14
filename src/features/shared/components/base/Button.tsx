import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import { cn, colors } from "../../theme";
import { Text } from "./Text";

type Variant = "highlight" | "primary" | "secondary";

type ButtonProps = Omit<PressableProps, "children"> & {
  title?: string;
  icon?: ReactNode;
  variant?: Variant;
  loading?: boolean;
  className?: string;
};

const containerStyles: Record<Variant, string> = {
  highlight: "bg-highlight active:bg-primary",
  primary: "bg-primary active:bg-secondary",
  secondary: "bg-fg1 active:bg-fg2 border border-fg1",
};

const labelStyles: Record<Variant, string> = {
  highlight: "text-bg",
  primary: "text-bg",
  secondary: "text-primary",
};

export function Button({
  title,
  icon,
  variant = "primary",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "min-h-10 flex-row items-center justify-center gap-2 rounded-full",
        title ? "px-4" : "size-10",
        containerStyles[variant],
        isDisabled && "opacity-80",
        className,
      )}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          color={
            variant === "primary" ? colors.spinnerOnDark : colors.spinnerOnLight
          }
        />
      )}
      {icon}
      {title && (
        <Text className={cn("text-[16] font-semibold", labelStyles[variant])}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
