import { useSession } from "@/features/account/internal/session";
import { updateBook } from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { registerCopies } from "@/features/inventory/internal/movement/service";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useRouter } from "expo-router";
import { useState } from "react";
import { COLUMNS, display, type Field } from "./fields/fields";
import {
  EMPTY_VALUES,
  fromBook,
  toBookInput,
  type BookFormValues,
} from "./fields/values";

export function useBookForm(book?: BookListItem) {
  const router = useRouter();
  const session = useSession();
  const { errors, setErrors, submitting, run } = useFormSubmit();
  const [values, setValues] = useState(() =>
    book ? fromBook(book) : EMPTY_VALUES,
  );

  const isEdit = !!book;
  const locked = (book?.copyCount ?? 0) > 0;

  const columns = COLUMNS.map((groups) =>
    groups.filter((g) => !g.createOnly || !isEdit),
  );
  const fields = columns.flat().flatMap((g) => g.fields);

  const isRequired = (f: Field) =>
    f.required === true || (f.required === "create" && !isEdit);

  const canSubmit = fields
    .filter(isRequired)
    .every((f) => display(values[f.key]) !== null);

  const isVisible = (f: Field) => !(f.createOnly && isEdit);

  const set = (patch: Partial<BookFormValues>) =>
    setValues((p) => ({
      ...p,
      ...patch,
      ...("publisher" in patch &&
        patch.publisher?.id !== p.publisher?.id && { collection: undefined }),
    }));

  const onFieldChange = (patch: Partial<BookFormValues>) => {
    set(patch);
    setErrors({ fields: {} });
  };

  function submit() {
    if (session.status !== "signed-in") return;
    run(
      async () => {
        if (book) {
          await updateBook(book.id, toBookInput(values));
          router.back();
          return;
        }
        const { lines } = await registerCopies(session.account.id, {
          shelfId: values.shelf?.id,
          lines: [
            {
              book: toBookInput(values),
              quantity: Number(values.quantity) || 1,
            },
          ],
        });
        router.replace(`/catalog/${lines[0].bookId}`);
      },
      (e) => {
        if (e.suggestedOmitWords?.length) {
          set({ omitWords: e.suggestedOmitWords.join(", ") });
        }
      },
    );
  }

  const shown = new Set(fields.map((f) => f.error ?? f.key));
  const orphanErrors = Object.entries(errors.fields)
    .filter(([key]) => !shown.has(key))
    .map(([key, message]) => `${key}: ${message}`)
    .join("\n");

  return {
    values,
    errors,
    orphanErrors,
    submitting,
    isEdit,
    locked,
    columns,
    canSubmit,
    isRequired,
    isVisible,
    onFieldChange,
    submit,
    cancel: () => router.back(),
  };
}

export type BookFormState = ReturnType<typeof useBookForm>;
