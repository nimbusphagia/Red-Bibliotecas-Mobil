import { setCopyDamaged } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Dialog,
  DialogActions,
  DialogHeader,
  FieldError,
  Text,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { View } from "react-native";

type Props = {
  copy: CopyItem;
  actorId: number;
  onClose: () => void;
  onDone: () => void;
};

/** Marca el ejemplar como deteriorado o, si ya lo está, como reparado. */
export default function DamageCopyDialog({
  copy,
  actorId,
  onClose,
  onDone,
}: Props) {
  const { errors, submitting, run } = useFormSubmit();
  const repair = copy.damagedAt !== null;

  const confirm = () =>
    run(async () => {
      await setCopyDamaged(actorId, { copyId: copy.id, damaged: !repair });
      onDone();
    });

  const error = errors.form ?? Object.values(errors.fields)[0];

  return (
    <Dialog size="sm" onClose={onClose}>
      <DialogHeader
        title={`#${copy.id} ${copy.bookTitle}`}
        subtitle={copy.labelText ?? undefined}
      />
      <View className="mb-2">
        <Text variant="caption">
          {repair
            ? "El ejemplar dejará de figurar como deteriorado."
            : "El ejemplar figurará como deteriorado. Se puede seguir prestando."}
        </Text>
      </View>
      <FieldError>{error}</FieldError>
      <DialogActions
        className="justify-between"
        confirmTitle={repair ? "Reparar" : "Marcar deteriorado"}
        loading={submitting}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
