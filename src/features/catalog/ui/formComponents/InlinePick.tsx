import {
  FieldError,
  SimpleSelect,
  type Option,
} from "@/features/shared/components";
import { View } from "react-native";
import { useOptions } from "../options";
import type { Field } from "./fields";

type Props = {
  field: Field;
  label: string;
  value?: Option;
  disabled?: boolean;
  error?: string;
  onChange: (option?: Option) => void;
};

export default function InlinePick({
  field,
  label,
  value,
  disabled,
  error,
  onChange,
}: Props) {
  const options = useOptions(field.load ?? null);

  return (
    <View className="pb-2 gap-1">
      <SimpleSelect
        label={label}
        options={options}
        value={value?.id}
        disabled={disabled}
        onChange={(id) => onChange(options.find((o) => o.id === id))}
      />
      <FieldError>{error}</FieldError>
    </View>
  );
}
