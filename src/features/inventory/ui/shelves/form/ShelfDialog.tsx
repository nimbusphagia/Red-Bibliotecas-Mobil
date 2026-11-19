import type { Shelf } from "@/features/inventory/internal/shelf/types";
import { Dialog } from "@/features/shared/components";
import ShelfForm from "./ShelfForm";

type Props = {
  shelf?: Shelf;
  onClose: () => void;
  onSaved: () => void;
};

export default function ShelfDialog({ shelf, onClose, onSaved }: Props) {
  return (
    <Dialog onClose={onClose}>
      <ShelfForm shelf={shelf} onCancel={onClose} onSaved={onSaved} />
    </Dialog>
  );
}
