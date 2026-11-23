import { useSession } from "@/features/account/internal/session";
import { updateBook } from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { registerCopies } from "@/features/inventory/internal/movement/service";
import type { FormErrors } from "@/features/shared/errors/messages";
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

/**
 * Estado de los campos del libro: valores, columnas visibles y validez. No
 * sabe cómo se guarda; quien lo usa decide qué hacer con `values`.
 */
export function useBookFields(
  book: BookListItem | undefined,
  initial: BookFormValues | undefined,
  errors: FormErrors,
  setErrors: (errors: FormErrors) => void,
) {
  const [values, setValues] = useState(() =>
    book ? fromBook(book) : (initial ?? EMPTY_VALUES),
  );

  const isEdit = !!book;
  const locked = (book?.copyCount ?? 0) > 0;

  const columns = COLUMNS.map((groups) =>
    groups.filter((g) => !g.createOnly || !isEdit),
  );
  const fields = columns.flat().flatMap((g) => g.fields);

  const isRequired = (f: Field) =>
    f.required === true || (f.required === "create" && !isEdit);

  const isVisible = (f: Field) => !(f.createOnly && isEdit);

  const canSubmit = fields
    .filter((f) => isVisible(f) && isRequired(f))
    .every((f) => display(values[f.key]) !== null);

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

  const shown = new Set(fields.map((f) => f.error ?? f.key));
  const orphanErrors = Object.entries(errors.fields)
    .filter(([key]) => !shown.has(key))
    .map(([key, message]) => `${key}: ${message}`)
    .join("\n");

  return {
    values,
    errors,
    orphanErrors,
    isEdit,
    locked,
    columns,
    canSubmit,
    isRequired,
    isVisible,
    set,
    onFieldChange,
  };
}

export type BookFormState = ReturnType<typeof useBookFields>;

export function useBookForm(book?: BookListItem) {
  const router = useRouter();
  const session = useSession();
  const { errors, setErrors, submitting, run } = useFormSubmit();
  const form = useBookFields(book, undefined, errors, setErrors);
  const { values, set } = form;

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

  return { ...form, submitting, submit, cancel: () => router.back() };
}
