import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import { cn, colors } from "../../theme";
import { Icon, type IconSize, type IconTone } from "./Icon";
import { Text } from "./Text";

type Variant = "highlight" | "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "children"> & {
  title?: string;
  icon?: LucideIcon;
  iconTone?: IconTone;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
};

const variantStyles: Record<
  Variant,
  { container: string; label: string; tone: IconTone; onDark: boolean }
> = {
  highlight: {
    container: "bg-dark1 active:bg-primary",
    label: "text-bg font-sans-medium",
    tone: "white",
    onDark: true,
  },
  primary: {
    container: "bg-dark2 active:bg-secondary",
    label: "text-white font-sans-medium",
    tone: "white",
    onDark: true,
  },
  secondary: {
    container: "bg-bg active:bg-bg border-dark3 border",
    label: "text-dark2",
    tone: "dark2",
    onDark: false,
  },
  ghost: {
    container: "bg-bg active:bg-accent2",
    label: "text-dark2",
    tone: "dark2",
    onDark: false,
  },
};

const sizeStyles: Record<
  Size,
  { withTitle: string; iconOnly: string; icon: IconSize; hit: number }
> = {
  sm: { withTitle: "min-h-9 px-3", iconOnly: "size-9", icon: "sm", hit: 6 },
  md: { withTitle: "min-h-10 px-4", iconOnly: "size-10", icon: "md", hit: 0 },
  lg: { withTitle: "min-h-12 px-6", iconOnly: "size-12", icon: "md", hit: 0 },
};

export function Button({
  title,
  icon,
  iconTone,
  variant = "primary",
  size = "md",
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
        "flex-row items-center justify-center gap-2 rounded-xl",
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
      {icon && <Icon icon={icon} size={s.icon} tone={iconTone ?? v.tone} />}
      {title && (
        <Text
          variant={size === "sm" ? "itemSm" : "item"}
          className={cn("font-sans", v.label)}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
