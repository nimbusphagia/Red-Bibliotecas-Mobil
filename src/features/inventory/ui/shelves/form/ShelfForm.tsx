import {
  createShelf,
  updateShelf,
} from "@/features/inventory/internal/shelf/service";
import type { Shelf } from "@/features/inventory/internal/shelf/types";
import {
  Button,
  FieldError,
  Text,
  TextField,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
import { ScrollView, View } from "react-native";

type Props = {
  shelf?: Shelf;
  onCancel: () => void;
  onSaved: (saved: Shelf) => void;
};

export default function ShelfForm({ shelf, onCancel, onSaved }: Props) {
  const [name, setName] = useState(shelf?.name ?? "");
  const [description, setDescription] = useState(shelf?.description ?? "");
  const { errors, submitting, run } = useFormSubmit();

  const save = () =>
    run(async () => {
      const input = { name, description };
      const saved = shelf
        ? await updateShelf(shelf.id, input)
        : await createShelf(input);
      onSaved(saved);
    });

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-4"
      showsVerticalScrollIndicator={false}
    >
      <Text variant="h3">
        {shelf ? "Editar estantería" : "Nueva estantería"}
      </Text>
      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        error={errors.fields.name}
        autoCapitalize="words"
      />
      <TextField
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        error={errors.fields.description}
        placeholder="Opcional"
        maxLength={200}
        onSubmitEditing={save}
      />
      <FieldError>{errors.form}</FieldError>
      <View className="flex-row justify-end gap-5">
        <Button title="Cancelar" variant="secondary" onPress={onCancel} />
        <Button title="Guardar" loading={submitting} onPress={save} />
      </View>
    </ScrollView>
  );
}
