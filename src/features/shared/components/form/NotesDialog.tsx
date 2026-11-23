import { useState } from "react";
import { Dialog, DialogActions } from "../base/Dialog";
import { TextField } from "./input/TextField";

type Props = {
  value: string;
  onChange: (notes: string) => void;
  onClose: () => void;
};

export function NotesDialog({ value, onChange, onClose }: Props) {
  const [draft, setDraft] = useState(value);
  const confirm = () => {
    onChange(draft.trim());
    onClose();
  };

  return (
    <Dialog onClose={onClose}>
      <TextField
        label="Notas"
        value={draft}
        onChangeText={setDraft}
        maxLength={500}
        onSubmitEditing={confirm}
        autoFocus
      />
      <DialogActions
        confirmTitle="Aceptar"
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
