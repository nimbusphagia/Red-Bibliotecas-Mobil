import { createAuthor } from "@/features/catalog/internal/author/service";
import { Button, Text } from "@/features/shared/components";
import { PillInput } from "@/features/shared/components/form";
import type { Option } from "@/features/shared/components/select/Select";
import {
  toFormErrors,
  type FormErrors,
} from "@/features/shared/errors/messages";
import { useState } from "react";
import { View } from "react-native";
import { fullName } from "../options";

type Props = {
  initialName: string;
  onCancel: () => void;
  onCreated: (author: Option) => void;
};

export default function NewAuthorForm({
  initialName,
  onCancel,
  onCreated,
}: Props) {
  const [firstName, setFirstName] = useState(initialName);
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const author = await createAuthor({ firstName, lastName });
      onCreated({ id: author.id, label: fullName(author) });
    } catch (error) {
      setErrors(toFormErrors(error));
      setSaving(false);
    }
  }

  return (
    <>
      <Text variant="h3">Nuevo autor</Text>
      <PillInput
        label="Nombre"
        value={firstName}
        onChangeText={setFirstName}
        error={errors.fields.firstName}
        autoCapitalize="words"
      />
      <PillInput
        label="Apellido (opcional)"
        value={lastName}
        onChangeText={setLastName}
        error={errors.fields.lastName}
        autoCapitalize="words"
        onSubmitEditing={save}
      />
      {errors.form ? (
        <Text className="text-sm text-red-600">{errors.form}</Text>
      ) : null}
      <View className="flex-row justify-end gap-5">
        <Button title="Cancelar" variant="pill-secondary" onPress={onCancel} />
        <Button title="Crear" variant="pill" loading={saving} onPress={save} />
      </View>
    </>
  );
}
