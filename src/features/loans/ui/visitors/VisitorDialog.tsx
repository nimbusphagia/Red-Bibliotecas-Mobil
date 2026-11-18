import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { Dialog } from "@/features/shared/components";
import VisitorForm from "./VisitorForm";

type Props = {
  visitor?: VisitorListItem;
  onClose: () => void;
  onSaved: () => void;
};

export default function VisitorDialog({ visitor, onClose, onSaved }: Props) {
  return (
    <Dialog onClose={onClose}>
      <VisitorForm visitor={visitor} onCancel={onClose} onSaved={onSaved} />
    </Dialog>
  );
}
