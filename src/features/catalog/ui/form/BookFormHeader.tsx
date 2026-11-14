import { Button, PageHeader } from "@/features/shared/components";
import type { BookFormState } from "./useBookForm";

export function BookFormHeader({ form }: { form: BookFormState }) {
  const { isEdit, submitting, canSubmit, submit, cancel } = form;
  return (
    <PageHeader title={isEdit ? "Editar libro" : "Registrar libro"}>
      <Button title="Cancelar" variant="secondary" onPress={cancel} />
      <Button
        title={isEdit ? "Guardar" : "Registrar"}
        loading={submitting}
        disabled={!canSubmit}
        onPress={submit}
      />
    </PageHeader>
  );
}
