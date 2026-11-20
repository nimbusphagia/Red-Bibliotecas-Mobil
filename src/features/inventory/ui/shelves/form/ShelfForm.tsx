import {
  createShelf,
  updateShelf,
} from "@/features/inventory/internal/shelf/service";
import type { Shelf } from "@/features/inventory/internal/shelf/types";
import {
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  TextField,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";

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
    <>
      <DialogHeader title={shelf ? "Editar estantería" : "Nueva estantería"} />
      <DialogBody>
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
      </DialogBody>
      <FieldError>{errors.form}</FieldError>
      <DialogActions
        confirmTitle="Guardar"
        loading={submitting}
        onConfirm={save}
        onCancel={onCancel}
      />
    </>
  );
}
