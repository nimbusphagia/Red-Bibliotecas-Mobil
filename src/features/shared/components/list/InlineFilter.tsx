import { View } from "react-native";
import type { AccentLevel } from "../../theme";
import { Button } from "../base/Button";

type Props<V extends string> = {
  /** `accent`: color de la opción cuando está activa. */
  options: { value: V; label: string; accent?: AccentLevel }[];
  value: V;
  onChange: (value: V) => void;
};

export function InlineFilter<V extends string>({
  options,
  value,
  onChange,
}: Props<V>) {
  return (
    <View className="flex-row gap-2">
      {options.map((o) => (
        <Button
          key={o.value}
          title={o.label}
          size="sm"
          variant={o.value === value ? "active" : "soft"}
          accent={o.value === value ? o.accent : undefined}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}
