import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import { cn, colors, useTone } from "../../theme";
import { Icon, type IconSize, type IconTone } from "./Icon";
import { Text } from "./Text";

/** `ghost`: sin fondo, solo el texto del tono actual. */
type Variant = "accent" | "active" | "solid" | "soft" | "selector" | "ghost";

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

const sizeStyles: Record<
  Size,
  { withTitle: string; iconOnly: string; icon: IconSize; hit: number }
> = {
  sm: { withTitle: "min-h-9 px-4", iconOnly: "size-9", icon: "sm", hit: 6 },
  md: { withTitle: "min-h-9 px-4", iconOnly: "size-9", icon: "md", hit: 0 },
  lg: { withTitle: "min-h-12 px-6", iconOnly: "size-12", icon: "md", hit: 0 },
};

export function Button({
  title,
  icon,
  iconTone,
  variant = "solid",
  size = "md",
  weight = "sm",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const t = useTone();
  const v =
    variant === "ghost"
      ? { box: "bg-transparent", label: t.text, icon: t.icon }
      : t.button[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={s.hit}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-lg active:opacity-80",
        title ? s.withTitle : s.iconOnly,
        v.box,
        isDisabled && "opacity-80",
        className,
      )}
      {...rest}
    >
      {loading && <ActivityIndicator color={colors[v.icon]} />}

      {icon && (
        <Icon
          icon={icon}
          size={!title && s.icon === "md" ? "lg" : s.icon}
          tone={iconTone ?? v.icon}
          stroke={weight}
        />
      )}
      {title && (
        <Text
          variant={size === "sm" ? "itemSm" : "item"}
          numberOfLines={1}
          className={cn(
            "shrink",
            v.label,
            weight === "md" && "font-sans-regular",
            weight === "lg" && "font-sans-medium",
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
