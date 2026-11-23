import { useSession } from "@/features/account/internal/session";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { EXIT_REASONS } from "@/features/inventory/internal/movement/schemas";
import { exitCopies } from "@/features/inventory/internal/movement/service";
import type { ExitReason } from "@/features/inventory/internal/movement/types";
import {
  Button,
  Dialog,
  FieldError,
  FieldRow,
  FormHeader,
  LabeledItem,
  NotesDialog,
  Panel,
  SimpleSelect,
  SplitColumns,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import { MOVEMENT_REASON_ES } from "@/features/shared/format/translate";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { canExit } from "./exit/canExit";
import ExitCopyPicker from "./exit/ExitCopyPicker";
import ExitCopyTable from "./exit/ExitCopyTable";

const REASON_OPTIONS = EXIT_REASONS.map((r) => ({
  id: r,
  label: MOVEMENT_REASON_ES[r],
}));

export default function ExitForm() {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [reason, setReason] = useState<ExitReason>("loss");
  const [notes, setNotes] = useState("");
  const [copies, setCopies] = useState<CopyItem[]>([]);
  const [editing, setEditing] = useState<"notes" | "copies" | null>(null);

  const blocked = copies.filter((c) => !canExit(c, reason)).length;

  const toggle = (c: CopyItem) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );

  const submit = () => {
    if (session.status !== "signed-in") return;
    run(async () => {
      const { movement } = await exitCopies(session.account.id, {
        reason,
        copyIds: copies.map((c) => c.id),
        notes,
      });
      router.replace(`/stock/${movement.id}`);
    });
  };

  return (
    <>
      <FormHeader
        title="Registrar salida"
        submitTitle="Registrar"
        submitting={submitting}
        canSubmit={copies.length > 0 && blocked === 0}
        onSubmit={submit}
        onCancel={() => router.back()}
      />
      <ScreenBody form>
        <FieldError>{errors.form}</FieldError>
        <SplitColumns>
          <Panel title="Detalles">
            <LabeledItem
              label="Encargado"
              content={
                session.status === "signed-in"
                  ? session.account.username
                  : undefined
              }
              labelWidth="form"
            />
            <LabeledItem
              label="Seleccionados"
              content={String(copies.length)}
              labelWidth="form"
            />
            <LabeledItem
              label="Registro"
              content={formatDate(new Date())}
              labelWidth="form"
            />
            <FieldRow
              label="Notas"
              value={notes || undefined}
              error={errors.fields.notes}
              onPress={() => setEditing("notes")}
            />
            <View className="mt-4 mb-2 gap-1">
              <SimpleSelect
                label="Motivo *"
                options={REASON_OPTIONS}
                value={reason}
                onChange={(r) => r && setReason(r)}
              />
              <FieldError>{errors.fields.reason}</FieldError>
            </View>
          </Panel>

          <Panel
            title="Ejemplares"
            lead={
              <Button
                title="Agregar"
                size="sm"
                onPress={() => setEditing("copies")}
              />
            }
          >
            <ExitCopyTable
              copies={copies}
              reason={reason}
              error={
                errors.fields.copyIds ??
                (blocked > 0
                  ? "Hay ejemplares dañados: no pueden salir por daño"
                  : undefined)
              }
              onRemove={(id) => setCopies((p) => p.filter((c) => c.id !== id))}
            />
          </Panel>
        </SplitColumns>
      </ScreenBody>

      {editing === "notes" && (
        <NotesDialog
          value={notes}
          onChange={setNotes}
          onClose={() => setEditing(null)}
        />
      )}
      {editing === "copies" && (
        <Dialog onClose={() => setEditing(null)} size="lg" tone="canvas">
          <ExitCopyPicker
            className="flex-1"
            reason={reason}
            selected={copies}
            onToggle={toggle}
          />
        </Dialog>
      )}
    </>
  );
}
