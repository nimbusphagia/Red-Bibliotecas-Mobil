import { useSession } from "@/features/account/internal/session";
import { loadShelves, useOptions } from "@/features/catalog/ui/options";
import { MAX_COPIES_PER_BOOK } from "@/features/inventory/internal/movement/schemas";
import { registerCopies } from "@/features/inventory/internal/movement/service";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  SimpleSelect,
  TextField,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";

type Props = {
  bookId: number;
  bookTitle: string;
  onClose: () => void;
  onAdded: () => void;
};

export default function AddCopiesDialog({
  bookId,
  bookTitle,
  onClose,
  onAdded,
}: Props) {
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [quantity, setQuantity] = useState("1");
  const [shelfId, setShelfId] = useState<number>();
  const shelves = useOptions(loadShelves);

  // loadShelves devuelve primero el estante por defecto.
  const selectedShelf = shelfId ?? shelves[0]?.id;
  const amount = Number(quantity);
  const valid =
    Number.isInteger(amount) &&
    amount >= 1 &&
    amount <= MAX_COPIES_PER_BOOK &&
    selectedShelf !== undefined;

  const confirm = () => {
    if (session.status !== "signed-in" || !valid) return;
    run(async () => {
      await registerCopies(session.account.id, {
        shelfId: selectedShelf,
        lines: [{ bookId, quantity: amount }],
      });
      onAdded();
    });
  };

  const error = errors.form ?? Object.values(errors.fields)[0];

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title={bookTitle} />
      <DialogBody className="max-h-72">
        <TextField
          label="Cantidad"
          value={quantity}
          onChangeText={(t) => setQuantity(t.replace(/\D/g, ""))}
          keyboardType="number-pad"
          error={
            amount > MAX_COPIES_PER_BOOK
              ? `Entre 1 y ${MAX_COPIES_PER_BOOK}`
              : undefined
          }
          onSubmitEditing={confirm}
        />
        <SimpleSelect
          label="Estante"
          options={shelves}
          value={selectedShelf}
          onChange={setShelfId}
        />
      </DialogBody>
      <FieldError>{error}</FieldError>
      <DialogActions
        confirmTitle="Agregar"
        loading={submitting}
        disabled={!valid}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
