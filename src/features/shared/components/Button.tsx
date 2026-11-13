import { ReactNode } from "react";
import type { PressableProps } from "react-native";
import { ActivityIndicator, Pressable } from "react-native";
import { cn, colors } from "../theme";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "pill" | "pill-secondary";

type ButtonProps = Omit<PressableProps, "children"> & {
  title?: string;
  lucideIcon?: ReactNode;
  variant?: Variant;
  loading?: boolean;
  className?: string;
};

const containerStyles: Record<Variant, string> = {
  primary: `bg-highlight active:bg-primary`,
  secondary: "border border-slate-300 bg-white active:bg-slate-100",
  pill: "bg-primary active:bg-secondary rounded-full",
  "pill-secondary": "bg-fg1  active:bg-fg2 rounded-full border border-fg1",
};

const labelStyles: Record<Variant, string> = {
  primary: "text-bg",
  secondary: "text-slate-900",
  pill: "text-bg",
  "pill-secondary": "text-primary",
};

export function Button({
  title,
  lucideIcon,
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
        "min-h-10 flex-row items-center justify-center gap-2 px-4",
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
      {lucideIcon}
      {title && (
        <Text className={cn("text-[16] font-semibold", labelStyles[variant])}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
