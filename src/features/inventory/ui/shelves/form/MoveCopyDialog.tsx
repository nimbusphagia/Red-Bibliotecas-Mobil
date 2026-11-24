import { useSession } from "@/features/account/internal/session";
import { loadShelves, useOptions } from "@/features/catalog/ui/options";
import { moveCopies } from "@/features/inventory/internal/shelf/service";
import type { ShelfCopy } from "@/features/inventory/internal/shelf/types";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  SimpleSelect,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";

type Props = {
  copy: Pick<ShelfCopy, "id" | "bookTitle" | "labelText">;
  currentShelfId: number;
  onClose: () => void;
  onMoved: () => void;
};

export default function MoveCopyDialog({
  copy,
  currentShelfId,
  onClose,
  onMoved,
}: Props) {
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [targetId, setTargetId] = useState<number>();
  const shelves = useOptions(loadShelves).filter(
    (s) => s.id !== currentShelfId,
  );

  const confirm = () => {
    if (session.status !== "signed-in" || targetId === undefined) return;
    run(async () => {
      await moveCopies(session.account.id, {
        shelfId: targetId,
        copyIds: [copy.id],
      });
      onMoved();
    });
  };

  const error =
    errors.form ??
    errors.fields["copyIds.0"] ??
    errors.fields.copyIds ??
    errors.fields.shelfId;

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={`#${copy.id} ${copy.bookTitle}`}
        subtitle={copy.labelText ?? undefined}
      />
      <DialogBody className="max-h-60">
        <SimpleSelect
          label="Destino"
          options={shelves}
          value={targetId}
          onChange={setTargetId}
        />
      </DialogBody>
      <FieldError>{error}</FieldError>
      <DialogActions
        confirmTitle="Mover"
        loading={submitting}
        disabled={targetId === undefined}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
