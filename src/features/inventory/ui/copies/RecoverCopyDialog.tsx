import type { CopyStatus } from "@/features/inventory/internal/copy/types";
import { recoverCopy } from "@/features/inventory/internal/movement/service";
import {
  Dialog,
  DialogActions,
  DialogHeader,
  FieldError,
  Text,
  TextField,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  copy: {
    copyId: number;
    bookTitle: string;
    labelText: string | null;
    status: CopyStatus;
  };
  actorId: number;
  onClose: () => void;
  onDone: (recoveryId: number) => void;
};

export default function RecoverCopyDialog({
  copy,
  actorId,
  onClose,
  onDone,
}: Props) {
  const [notes, setNotes] = useState("");
  const { errors, submitting, run } = useFormSubmit();
  // Revierte un deterioro: el ejemplar se reparó.
  const repair = copy.status === "damaged";

  const confirm = () =>
    run(async () => {
      const { movement } = await recoverCopy(actorId, {
        copyId: copy.copyId,
        notes,
      });
      onDone(movement.id);
    });

  const error = errors.form ?? Object.values(errors.fields)[0];

  return (
    <Dialog size="sm" onClose={onClose}>
      <DialogHeader
        title={`#${copy.copyId} ${copy.bookTitle}`}
        subtitle={copy.labelText ?? undefined}
      />
      <View className="mb-2 gap-4">
        <Text variant="caption">
          {repair
            ? "El ejemplar dejará de figurar como deteriorado."
            : "El ejemplar volverá al inventario."}{" "}
          Se registrará una entrada de recuperación que revierte su salida.
        </Text>
        <TextField
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          maxLength={500}
        />
      </View>
      <FieldError>{error}</FieldError>
      <DialogActions
        className="justify-between"
        confirmTitle={repair ? "Reparar" : "Recuperar"}
        loading={submitting}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
