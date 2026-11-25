import {
  Dialog,
  SearchSelect,
  type Option,
} from "@/features/shared/components";
import { searchShelves } from "../options";

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
