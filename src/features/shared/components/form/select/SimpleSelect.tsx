import { View } from "react-native";
import { cn } from "../../../theme";
import { Text } from "../../base/Text";
import { Chip } from "./Chip";

type SimpleProps<V extends string | number> = {
  label: string;
  options: { id: V; label: string }[];
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
    <View className={cn("gap-3", disabled && "opacity-50")}>
      <Text variant="item">{label}</Text>
      <View className="flex-row flex-wrap gap-x-3 gap-y-4">
        {options.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            selected={o.id === value}
            disabled={disabled}
            onPress={() => onChange(o.id === value ? undefined : o.id)}
          />
        ))}
      </View>
    </View>
  );
}
