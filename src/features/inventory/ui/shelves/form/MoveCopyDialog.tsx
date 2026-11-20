import { useSession } from "@/features/account/internal/session";
import { moveCopies } from "@/features/inventory/internal/shelf/service";
import type { ShelfCopy } from "@/features/inventory/internal/shelf/types";
import { loadShelves, useOptions } from "@/features/catalog/ui/options";
import {
  Button,
  Dialog,
  FieldError,
  SimpleSelect,
  Text,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
import { ScrollView, View } from "react-native";

type Props = {
  copy: ShelfCopy;
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
      <View className="gap-1">
        <Text variant="h3">{`#${copy.id} ${copy.bookTitle}`}</Text>
        <Text variant="subtitle">{copy.labelText}</Text>
      </View>
      <ScrollView
        className="max-h-[260px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SimpleSelect
          label="Destino"
          options={shelves}
          value={targetId}
          onChange={setTargetId}
        />
      </ScrollView>
      <FieldError>{error}</FieldError>
      <View className="flex-row justify-end gap-5">
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <Button
          title="Mover"
          loading={submitting}
          disabled={targetId === undefined}
          onPress={confirm}
        />
      </View>
    </Dialog>
  );
}
