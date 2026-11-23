import type { RegisterCopiesInput } from "@/features/inventory/internal/movement/schemas";
import {
  toBookInput,
  type BookFormValues,
} from "@/features/catalog/ui/form/fields/values";
import type { Option } from "@/features/shared/components";
import type { FormErrors } from "@/features/shared/errors/messages";

/** Una línea de la entrada: un libro que ya existe o uno nuevo, con su cantidad. */
export type EntryLine = { key: number; error?: FormErrors } & (
  | { kind: "existing"; book: Option; quantity: number; shelf: Option }
  | { kind: "new"; values: BookFormValues }
);

export const lineTitle = (l: EntryLine) =>
  l.kind === "existing" ? l.book.label : l.values.title;

export const lineQuantity = (l: EntryLine) =>
  l.kind === "existing" ? l.quantity : Number(l.values.quantity) || 1;

export const lineShelf = (l: EntryLine) =>
  l.kind === "existing" ? l.shelf : l.values.shelf;

export const toLineInput = (
  l: EntryLine,
): RegisterCopiesInput["lines"][number] =>
  l.kind === "existing"
    ? { bookId: l.book.id, quantity: l.quantity, shelfId: l.shelf.id }
    : {
        book: toBookInput(l.values),
        quantity: lineQuantity(l),
        shelfId: l.values.shelf?.id,
      };

export const lineErrorText = (l: EntryLine) =>
  l.error && (l.error.form ?? Object.values(l.error.fields)[0]);
