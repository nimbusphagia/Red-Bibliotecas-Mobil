import {
  Button,
  Dialog,
  SearchSelect,
  TextField,
  type Option,
} from "@/features/shared/components";
import { useState } from "react";
import { View } from "react-native";
import { searchVisitors, type LoanCopy } from "../options";
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
  return (
    <Dialog onClose={onClose}>
      <SearchSelect
        label="Visitante"
        initiallyOpen
        value={value}
        onChange={(o) => {
          onChange(o);
          onClose();
        }}
        fetchOptions={searchVisitors}
        placeholder="Buscar visitante..."
      />
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
      <View className="flex-row justify-end gap-5">
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <Button title="Aceptar" onPress={confirm} />
      </View>
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
    <Dialog onClose={onClose} className="h-[70%] w-[600px]">
      <CopyPicker className="flex-1" selected={selected} onToggle={onToggle} />
    </Dialog>
  );
}
