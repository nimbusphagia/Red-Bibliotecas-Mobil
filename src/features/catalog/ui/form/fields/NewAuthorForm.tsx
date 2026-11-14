import { createAuthor } from "@/features/catalog/internal/author/service";
import {
  Button,
  FieldError,
  TextField,
  Text,
  type Option,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
import { View } from "react-native";
import { fullName } from "../../options";

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
  const { errors, submitting, run } = useFormSubmit();
  const save = () =>
    run(async () => {
      const author = await createAuthor({ firstName, lastName });
      onCreated({ id: author.id, label: fullName(author) });
    });

  return (
    <>
      <Text variant="h3">Nuevo autor</Text>
      <TextField
        label="Nombre"
        value={firstName}
        onChangeText={setFirstName}
        error={errors.fields.firstName}
        autoCapitalize="words"
      />
      <TextField
        label="Apellido"
        value={lastName}
        onChangeText={setLastName}
        error={errors.fields.lastName}
        autoCapitalize="words"
        onSubmitEditing={save}
      />
      <FieldError>{errors.form}</FieldError>
      <View className="flex-row justify-end gap-5">
        <Button title="Cancelar" variant="secondary" onPress={onCancel} />
        <Button title="Crear" loading={submitting} onPress={save} />
      </View>
    </>
  );
}
