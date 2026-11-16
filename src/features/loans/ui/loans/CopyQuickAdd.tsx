import { TextField, type Option } from "@/features/shared/components";
import { useState } from "react";
import { View } from "react-native";
import { copyById, copyByLabel } from "../options";

type FieldProps = {
  label: string;
  find: (text: string) => Promise<Option | null>;
  onAdd: (option: Option) => void;
  numeric?: boolean;
};

function QuickField({ label, find, onAdd, numeric }: FieldProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (!text.trim()) return;
    const option = await find(text);
    if (!option) return setError("No se encontró el ejemplar");
    onAdd(option);
    setText("");
  };

  return (
    <TextField
      label={label}
      value={text}
      onChangeText={(t) => {
        setText(numeric ? t.replace(/\D/g, "") : t);
        setError(undefined);
      }}
      error={error}
      keyboardType={numeric ? "number-pad" : "default"}
      submitBehavior="submit"
      onSubmitEditing={submit}
    />
  );
}

export default function CopyQuickAdd({
  onAdd,
}: {
  onAdd: (option: Option) => void;
}) {
  return (
    <View className="flex-row gap-4">
      <View className="flex-[2]">
        <QuickField label="Tejuelo" find={copyByLabel} onAdd={onAdd} />
      </View>
      <View className="flex-1">
        <QuickField label="ID" find={copyById} numeric onAdd={onAdd} />
      </View>
    </View>
  );
}
