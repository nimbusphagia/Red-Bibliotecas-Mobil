import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import { accents, cn, colors, useTone, type AccentLevel } from "../../theme";
import { Icon, type IconSize, type IconTone } from "./Icon";
import { Text } from "./Text";

/** `ghost`: sin fondo, solo el texto del tono actual. */
type Variant = "accent" | "active" | "solid" | "soft" | "selector" | "ghost";

type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "children"> & {
  title?: string;
  icon?: LucideIcon;
  iconTone?: IconTone;
  iconSize?: IconSize;
  iconPosition?: "start" | "end";
  variant?: Variant;
  /** Reemplaza los colores de la variante. */
  accent?: AccentLevel;
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
  iconSize,
  iconPosition = "start",
  variant = "solid",
  accent,
  size = "md",
  weight = "sm",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const t = useTone();
  const v = accent
    ? accents[accent]
    : variant === "ghost"
      ? { box: "bg-transparent", label: t.text, icon: t.icon }
      : t.button[variant];
  const s = sizeStyles[size];
  const iconNode = icon && (
    <Icon
      icon={icon}
      size={iconSize ?? (!title && s.icon === "md" ? "lg" : s.icon)}
      tone={iconTone ?? v.icon}
      stroke={weight}
    />
  );

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

      {iconPosition === "start" && iconNode}
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
      {iconPosition === "end" && iconNode}
    </Pressable>
  );
}
