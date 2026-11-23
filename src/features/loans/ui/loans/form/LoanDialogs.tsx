import {
  Dialog,
  SearchSelect,
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
