import { getBookItem } from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { FieldError, FormHeader, Text } from "@/features/shared/components";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { BookFormSections } from "./form/BookFormSections";
import FieldModal from "./form/fields/FieldModal";
import { type Field } from "./form/fields/fields";
import { useBookForm } from "./form/useBookForm";

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
        submitTitle={form.isEdit ? "Guardar" : "Registrar"}
        submitting={form.submitting}
        canSubmit={form.canSubmit}
        onSubmit={form.submit}
        onCancel={form.cancel}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pt-7"
        keyboardShouldPersistTaps="handled"
      >
        <FieldError>{form.errors.form ?? form.orphanErrors}</FieldError>
        {form.locked && (
          <Text variant="caption">
            Título, escritor, categoría y subcategoría están bloqueados porque
            el libro ya tiene tejuelos.
          </Text>
        )}
        <BookFormSections form={form} onEdit={setEditing} />
      </ScrollView>

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
