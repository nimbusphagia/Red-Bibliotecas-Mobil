import { ActivityIndicator, Pressable } from "react-native";
import type { PressableProps } from "react-native";
import { Text } from "./Text";
import { cn, colors } from "../utils";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = Omit<PressableProps, "children"> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
};

const containerStyles: Record<Variant, string> = {
  primary: `bg-primary active:bg-highlight`,
  secondary: "border border-slate-300 bg-white active:bg-slate-100",
  ghost: "bg-transparent active:bg-slate-100",
};

const labelStyles: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-slate-900",
  ghost: "text-blue-600",
};

export function Button({
  title,
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
      <Text className={cn("text-base font-semibold", labelStyles[variant])}>
        {title}
      </Text>
    </Pressable>
  );
}
