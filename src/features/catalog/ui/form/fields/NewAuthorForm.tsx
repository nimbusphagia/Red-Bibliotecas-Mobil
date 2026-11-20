import { createAuthor } from "@/features/catalog/internal/author/service";
import {
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  TextField,
  type Option,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
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
      <DialogHeader title="Nuevo autor" />
      <DialogBody>
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
      </DialogBody>
      <FieldError>{errors.form}</FieldError>
      <DialogActions
        confirmTitle="Crear"
        loading={submitting}
        onConfirm={save}
        onCancel={onCancel}
      />
    </>
  );
}
