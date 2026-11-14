import { View } from "react-native";
import { cn } from "../../../theme";
import { Text } from "../../base/Text";
import { Chip } from "./Chip";
import type { Option } from "./option";

type SimpleProps = {
  label: string;
  options: Option[];
  value?: number;
  onChange: (id?: number) => void;
  disabled?: boolean;
};

export function SimpleSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: SimpleProps) {
  return (
    <View className={cn("gap-3", disabled && "opacity-50")}>
      <Text variant="h3">{label}</Text>
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
