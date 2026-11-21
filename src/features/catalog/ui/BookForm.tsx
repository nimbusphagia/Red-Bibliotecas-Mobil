import { getBookItem } from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { FieldError, FormHeader, Text } from "@/features/shared/components";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { BookFormSections } from "./form/BookFormSections";
import FieldModal from "./form/fields/FieldModal";
import { type Field } from "./form/fields/fields";
import { useBookForm } from "./form/useBookForm";
import { ScreenBody } from "@/features/shared/layout/Screen";

export default function BookForm({ id }: { id?: string }) {
  const [book, setBook] = useState<BookListItem>();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getBookItem(routeIdSchema.parse(id)).then((b) => {
      if (!cancelled) setBook(b);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (id && !book) return <ActivityIndicator />;
  return <Form key={book?.id} book={book} />;
}

function Form({ book }: { book?: BookListItem }) {
  const form = useBookForm(book);
  const [editing, setEditing] = useState<Field | null>(null);

  return (
    <>
      <FormHeader
        title={form.isEdit ? "Editar libro" : "Registrar libro"}
        subtitle={
          form.locked
            ? "Este libro ya cuenta con ejemplares con tejuelos emitidos, los datos principales no se pueden editar."
            : undefined
        }
        submitTitle={form.isEdit ? "Guardar" : "Registrar"}
        submitting={form.submitting}
        canSubmit={form.canSubmit}
        onSubmit={form.submit}
        onCancel={form.cancel}
      />

      <ScreenBody form>
        <FieldError>{form.errors.form ?? form.orphanErrors}</FieldError>
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
