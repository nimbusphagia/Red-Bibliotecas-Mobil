import { ActivityIndicator, Pressable } from "react-native";
import type { PressableProps } from "react-native";
import { Text } from "./Text";
import { cn, colors } from "../utils";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "pill";

type ButtonProps = Omit<PressableProps, "children"> & {
  title: string;
  lucideIcon?: ReactNode;
  variant?: Variant;
  loading?: boolean;
  className?: string;
};

const containerStyles: Record<Variant, string> = {
  primary: `bg-highlight active:bg-primary`,
  pill: "bg-highlight active:bg-primary rounded-full",
  secondary: "border border-slate-300 bg-white active:bg-slate-100",
};

const labelStyles: Record<Variant, string> = {
  primary: "text-white",
  pill: "text-white",
  secondary: "text-slate-900",
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
        "min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-4",
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
      <Text className={cn("text-base font-semibold", labelStyles[variant])}>
        {title}
      </Text>
    </Pressable>
  );
}
