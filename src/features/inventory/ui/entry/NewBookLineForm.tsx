import { BookFormSections } from "@/features/catalog/ui/form/BookFormSections";
import FieldModal from "@/features/catalog/ui/form/fields/FieldModal";
import type { Field } from "@/features/catalog/ui/form/fields/fields";
import type { BookFormValues } from "@/features/catalog/ui/form/fields/values";
import { useBookFields } from "@/features/catalog/ui/form/useBookForm";
import { FieldError, FormHeader } from "@/features/shared/components";
import type { FormErrors } from "@/features/shared/errors/messages";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useState } from "react";

type Props = {
  initial: BookFormValues;
  /** Errores de un intento anterior de registrar la entrada. */
  errors?: FormErrors;
  isNew: boolean;
  onSave: (values: BookFormValues) => void;
  onCancel: () => void;
};

/**
 * Los mismos campos que «Registrar libro», pero sin guardar nada: el libro se
 * crea al registrar la entrada completa.
 */
export default function NewBookLineForm({
  initial,
  errors: initialErrors,
  isNew,
  onSave,
  onCancel,
}: Props) {
  const [errors, setErrors] = useState<FormErrors>(
    initialErrors ?? { fields: {} },
  );
  const form = useBookFields(undefined, initial, errors, setErrors);
  const [editing, setEditing] = useState<Field | null>(null);

  return (
    <>
      <FormHeader
        title={isNew ? "Libro nuevo" : "Editar libro"}
        subtitle="Se creará al registrar la entrada"
        submitTitle={isNew ? "Agregar" : "Guardar"}
        submitting={false}
        canSubmit={form.canSubmit}
        onSubmit={() => onSave(form.values)}
        onCancel={onCancel}
      />
      <ScreenBody form>
        <FieldError>{errors.form ?? form.orphanErrors}</FieldError>
        <BookFormSections form={form} onEdit={setEditing} />
      </ScreenBody>
      {editing && (
        <FieldModal
          field={editing}
          values={form.values}
          onChange={form.onFieldChange}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
