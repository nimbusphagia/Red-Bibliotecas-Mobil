import {
  Dialog,
  DialogActions,
  SearchSelect,
  TextField,
  type Option,
} from "@/features/shared/components";
import { useState } from "react";
import { searchVisitors, type LoanCopy } from "../../options";
import VisitorForm from "../../visitors/form/VisitorForm";
import CopyPicker from "./CopyPicker";

export function PickVisitorDialog({
  value,
  onChange,
  onClose,
}: {
  value?: Option;
  onChange: (option?: Option) => void;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState<string | null>(null);
  const pick = (option?: Option) => {
    onChange(option);
    onClose();
  };

  return (
    <Dialog onClose={onClose}>
      {newName === null ? (
        <SearchSelect
          label="Visitante"
          initiallyOpen
          value={value}
          onChange={pick}
          fetchOptions={searchVisitors}
          placeholder="Buscar visitante..."
          onCreate={setNewName}
        />
      ) : (
        <VisitorForm
          initialName={newName}
          onCancel={() => setNewName(null)}
          onSaved={(v) => pick({ id: v.id, label: v.name })}
        />
      )}
    </Dialog>
  );
}

export function NotesDialog({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (notes: string) => void;
  onClose: () => void;
}) {
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

export function CopySearchDialog({
  selected,
  onToggle,
  onClose,
}: {
  selected: LoanCopy[];
  onToggle: (copy: LoanCopy) => void;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} size="lg" tone="canvas">
      <CopyPicker className="flex-1" selected={selected} onToggle={onToggle} />
    </Dialog>
  );
}
