import { listBooks } from "@/features/catalog/internal/book/service";
import { writersOf } from "@/features/catalog/ui/options";
import { MAX_COPIES_PER_BOOK } from "@/features/inventory/internal/movement/schemas";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  SearchSelect,
  SimpleSelect,
  TextField,
  type Option,
} from "@/features/shared/components";
import { useCallback, useState } from "react";

type Value = { book: Option; quantity: number; shelf: Option };

type Props = {
  /** Línea que se edita; sin ella se agrega una nueva. */
  initial?: Value;
  /** Libros que ya están en la entrada (no se pueden repetir). */
  takenIds: number[];
  shelves: Option[];
  error?: string;
  onSave: (value: Value) => void;
  onClose: () => void;
};

export default function ExistingBookDialog({
  initial,
  takenIds,
  shelves,
  error,
  onSave,
  onClose,
}: Props) {
  const [book, setBook] = useState(initial?.book);
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  const [shelfId, setShelfId] = useState(initial?.shelf.id);

  const taken = takenIds.join(",");
  const fetchBooks = useCallback(
    async (search: string): Promise<Option[]> => {
      const skip = new Set(taken ? taken.split(",").map(Number) : []);
      const { items } = await listBooks({ search, active: true, limit: 20 });
      return items
        .filter((b) => !skip.has(b.id))
        .map((b) => ({
          id: b.id,
          label: [b.title, writersOf(b)].filter(Boolean).join(" · "),
        }));
    },
    [taken],
  );

  // Las estanterías llegan primero con la general al principio.
  const selectedShelf = shelves.find(
    (s) => s.id === (shelfId ?? shelves[0]?.id),
  );
  const amount = Number(quantity);
  const valid =
    !!book &&
    !!selectedShelf &&
    Number.isInteger(amount) &&
    amount >= 1 &&
    amount <= MAX_COPIES_PER_BOOK;

  const confirm = () => {
    if (!valid) return;
    onSave({ book, quantity: amount, shelf: selectedShelf });
  };

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title="Libro existente" subtitle="Agrega ejemplares" />
      <DialogBody className="max-h-96">
        <SearchSelect
          label="Libro"
          initiallyOpen={!book}
          value={book}
          onChange={setBook}
          fetchOptions={fetchBooks}
          placeholder="Buscar libro..."
        />
        <TextField
          label="Cantidad"
          value={quantity}
          onChangeText={(t) => setQuantity(t.replace(/\D/g, ""))}
          keyboardType="number-pad"
          helperText={`Entre 1 y ${MAX_COPIES_PER_BOOK}`}
          onSubmitEditing={confirm}
        />
        <SimpleSelect
          label="Estante"
          options={shelves}
          value={selectedShelf?.id}
          onChange={setShelfId}
        />
      </DialogBody>
      <FieldError>{error}</FieldError>
      <DialogActions
        confirmTitle={initial ? "Guardar" : "Agregar"}
        disabled={!valid}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
