import { View } from "react-native";
import { cn, useTone } from "../../../theme";
import { Text } from "../../base/Text";
import { Chip } from "./Chip";
import type { Option } from "./option";
import { SearchSelect, type SearchSelectProps } from "./SearchSelect";

type Props = Omit<SearchSelectProps, "value" | "onChange"> & {
  values: Option[];
  onChange: (options: Option[]) => void;
};

export function MultiSearchSelect({
  label,
  values,
  onChange,
  ...search
}: Props) {
  const t = useTone();
  const add = (option?: Option) => {
    if (option && !values.some((v) => v.id === option.id)) {
      onChange([...values, option]);
    }
  };

  return (
    <View className="gap-4">
      {label && <Text variant="item">{label}</Text>}
      <SearchSelect {...search} onChange={add} />
      {values.length > 0 && (
        <View
          className={cn(
            "flex-row flex-wrap justify-start gap-3 rounded-lg p-4",
            t.inset,
          )}
        >
          {values.map((o) => (
            <Chip
              key={o.id}
              label={o.label}
              detail={o.detail}
              selected
              onPress={() => onChange(values.filter((v) => v.id !== o.id))}
            />
          ))}
        </View>
      )}
    </View>
  );
}
