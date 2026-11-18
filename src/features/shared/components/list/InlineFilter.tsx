import { View } from "react-native";
import { Button } from "../base/Button";

type Props<V extends string> = {
  options: { value: V; label: string }[];
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
          variant={o.value === value ? "primary" : "secondary"}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}
