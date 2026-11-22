import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import { cn, colors, useTone } from "../../theme";
import { Icon, type IconSize, type IconTone } from "./Icon";
import { Text } from "./Text";

/**
 * Variantes por ROL, no por color. El color real sale de la superficie
 * (ver theme/tone.ts):
 *  - accent: acción principal / seleccionado (accent2)
 *  - solid:  acción neutra con peso (dark1 en blanco, dark2 en dark1)
 *  - soft:   acción secundaria / iconos en filas (bg en blanco, dark2/60 en dark1)
 */
type Variant = "accent" | "solid" | "soft";

/** @deprecated nombres viejos, migrar a Variant. Se mapean aquí para no romper pantallas pendientes. */
type LegacyVariant =
  "softAccent" | "highlight" | "primary" | "secondary" | "ghost";
const legacy: Record<LegacyVariant, Variant> = {
  softAccent: "accent",
  highlight: "solid",
  primary: "solid",
  secondary: "soft",
  ghost: "soft",
};

type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "children"> & {
  title?: string;
  icon?: LucideIcon;
  iconTone?: IconTone;
  variant?: Variant | LegacyVariant;
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
  const name =
    variant in legacy ? legacy[variant as LegacyVariant] : (variant as Variant);
  const v = useTone().button[name];
  const s = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={s.hit}
      className={cn(
        // Presionado por opacidad: no depende de ningún color de la paleta.
        "flex-row items-center justify-center gap-1 rounded-lg active:opacity-80",
        title ? s.withTitle : s.iconOnly,
        v.box,
        isDisabled && "opacity-80",
        className,
      )}
      {...rest}
    >
      {loading && <ActivityIndicator color={colors[v.icon]} />}

      {title && (
        <Text
          variant={size === "sm" ? "itemSm" : "item"}
          className={cn(
            v.label,
            weight === "md" && "font-sans-regular",
            weight === "lg" && "font-sans-medium",
          )}
        >
          {title}
        </Text>
      )}
      {icon && (
        <Icon
          icon={icon}
          size={!title && s.icon === "md" ? "lg" : s.icon}
          tone={iconTone ?? v.icon}
          stroke={weight}
        />
      )}
    </Pressable>
  );
}
