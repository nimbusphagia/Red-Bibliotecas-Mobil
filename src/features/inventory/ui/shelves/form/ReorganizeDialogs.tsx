import {
  Dialog,
  SearchSelect,
  type Option,
} from "@/features/shared/components";
import { searchShelves, type MoveCopy } from "../options";
import ShelfCopyPicker from "./ShelfCopyPicker";

export function PickShelfDialog({
  value,
  onChange,
  onClose,
}: {
  value?: Option;
  onChange: (option?: Option) => void;
  onClose: () => void;
}) {
  const pick = (option?: Option) => {
    onChange(option);
    onClose();
  };

  return (
    <Dialog onClose={onClose}>
      <SearchSelect
        label="Estantería destino"
        initiallyOpen
        value={value}
        onChange={pick}
        fetchOptions={searchShelves}
        placeholder="Buscar estantería..."
      />
    </Dialog>
  );
}

export function CopySearchDialog({
  selected,
  onToggle,
  onClose,
}: {
  selected: MoveCopy[];
  onToggle: (copy: MoveCopy) => void;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} size="lg">
      <ShelfCopyPicker
        className="flex-1"
        selected={selected}
        onToggle={onToggle}
      />
    </Dialog>
  );
}
