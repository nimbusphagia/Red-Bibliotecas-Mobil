import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import { cn, colors } from "../../theme";
import { Icon, type IconSize, type IconTone } from "./Icon";
import { Text } from "./Text";

type Variant =
  "accent" | "softAccent" | "highlight" | "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "children"> & {
  title?: string;
  icon?: LucideIcon;
  iconTone?: IconTone;
  variant?: Variant;
  size?: Size;
  weight?: Size;
  loading?: boolean;
  className?: string;
};

const variantStyles: Record<
  Variant,
  { container: string; label: string; tone: IconTone; onDark: boolean }
> = {
  accent: {
    container: "bg-accent2 active:bg-accent2",
    label: "text-dark1 ",
    tone: "dark1",
    onDark: true,
  },
  softAccent: {
    container: "bg-dark2 active:bg-accent2",
    label: "text-accent2",
    tone: "accent2",
    onDark: true,
  },
  highlight: {
    container: "bg-dark1 active:bg-primary",
    label: "text-bg",
    tone: "white",
    onDark: true,
  },
  primary: {
    container: "bg-dark2 active:bg-secondary",
    label: "text-white",
    tone: "white",
    onDark: true,
  },
  secondary: {
    container: "bg-bg active:bg-bg border border-dark3",
    label: "text-dark1",
    tone: "dark1",
    onDark: false,
  },
  ghost: {
    container: "bg-bg active:bg-accent2",
    label: "text-dark1",
    tone: "dark1",
    onDark: false,
  },
};

const sizeStyles: Record<
  Size,
  { withTitle: string; iconOnly: string; icon: IconSize; hit: number }
> = {
  sm: { withTitle: "min-h-8 px-3", iconOnly: "size-8", icon: "sm", hit: 6 },
  md: { withTitle: "min-h-9 px-4", iconOnly: "size-9", icon: "md", hit: 0 },
  lg: { withTitle: "min-h-12 px-6", iconOnly: "size-12", icon: "md", hit: 0 },
};

export function Button({
  title,
  icon,
  iconTone,
  variant = "primary",
  size = "md",
  weight = "sm",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={s.hit}
      className={cn(
        "flex-row items-center justify-center gap-1 rounded-lg",
        title ? s.withTitle : s.iconOnly,
        v.container,
        isDisabled && "opacity-80",
        className,
      )}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          color={v.onDark ? colors.spinnerOnDark : colors.spinnerOnLight}
        />
      )}

      {title && (
        <Text
          variant={size === "sm" ? "itemSm" : "item"}
          className={cn(
            "font-sans",
            v.label,
            weight === "md" && "font-sans-medium",
          )}
        >
          {title}
        </Text>
      )}
      {icon && (
        <Icon
          icon={icon}
          size={!title && s.icon === "md" ? "lg" : s.icon}
          tone={iconTone ?? v.tone}
          stroke={weight}
        />
      )}
    </Pressable>
  );
}
