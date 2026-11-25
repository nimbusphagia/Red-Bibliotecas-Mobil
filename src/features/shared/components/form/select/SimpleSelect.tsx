import { View } from "react-native";
import Animated from "react-native-reanimated";
import { cn, type AccentLevel } from "../../../theme";
import { LAYOUT } from "../../base/motion";
import { Text } from "../../base/Text";
import { Chip } from "./Chip";

type SimpleProps<V extends string | number> = {
  label: string;
  /** `accent` reemplaza el color del chip cuando está elegido. */
  options: { id: V; label: string; accent?: AccentLevel }[];
  value?: V;
  onChange: (id?: V) => void;
  disabled?: boolean;
};

export function SimpleSelect<V extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SimpleProps<V>) {
  return (
    <Animated.View
      layout={LAYOUT}
      className={cn("gap-3", disabled && "opacity-80")}
    >
      <Text variant="item">{label}</Text>
      <View className="flex-row flex-wrap gap-x-3 gap-y-4">
        {options.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            selected={o.id === value}
            accent={o.id === value ? o.accent : undefined}
            disabled={disabled}
            onPress={() => onChange(o.id === value ? undefined : o.id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}
