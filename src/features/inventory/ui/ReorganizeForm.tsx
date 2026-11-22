import { useSession } from "@/features/account/internal/session";
import { moveCopies } from "@/features/inventory/internal/shelf/service";
import {
  Button,
  FieldError,
  FieldRow,
  FormHeader,
  Panel,
  SplitColumns,
  type Option,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useRouter } from "expo-router";
import { useState } from "react";
import MoveCopyTable from "./shelves/form/MoveCopyTable";
import {
  CopySearchDialog,
  PickShelfDialog,
} from "./shelves/form/ReorganizeDialogs";
import type { MoveCopy } from "./shelves/options";
import { ScreenBody } from "@/features/shared/layout/Screen";

export default function ReorganizeForm() {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [target, setTarget] = useState<Option>();
  const [copies, setCopies] = useState<MoveCopy[]>([]);
  const [editing, setEditing] = useState<"target" | "copies" | null>(null);
  const close = () => setEditing(null);

  const pending = copies.filter((c) => c.shelfId !== target?.id).length;

  const copyError =
    Object.entries(errors.fields)
      .filter(([key]) => key.startsWith("copyIds"))
      .map(([key, message]) => {
        const c = copies[Number(key.split(".")[1])];
        return c ? `${c.labelText ?? `#${c.id}`}: ${message}` : message;
      })
      .join("\n") || undefined;

  const submit = () => {
    if (session.status !== "signed-in" || !target) return;
    run(async () => {
      await moveCopies(session.account.id, {
        shelfId: target.id,
        copyIds: copies.map((c) => c.id),
      });
      router.replace(`/shelves/${target.id}`);
    });
  };

  const removeCopy = (id: number) =>
    setCopies((p) => p.filter((c) => c.id !== id));

  const toggleCopy = (c: MoveCopy) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );

  return (
    <>
      <FormHeader
        title="Reorganizar"
        submitTitle="Mover"
        submitting={submitting}
        canSubmit={!!target && pending > 0}
        onSubmit={submit}
        onCancel={() => router.back()}
      />
      <ScreenBody form>
        <FieldError>{errors.form}</FieldError>
        <SplitColumns>
          <Panel title="Detalles">
            <FieldRow
              label="Destino *"
              value={target?.label}
              error={errors.fields.shelfId}
              onPress={() => setEditing("target")}
            />
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
            <MoveCopyTable
              copies={copies}
              targetId={target?.id}
              error={copyError}
              onRemove={removeCopy}
            />
          </Panel>
        </SplitColumns>
      </ScreenBody>

      {editing === "target" && (
        <PickShelfDialog value={target} onChange={setTarget} onClose={close} />
      )}

      {editing === "copies" && (
        <CopySearchDialog
          selected={copies}
          onToggle={toggleCopy}
          onClose={close}
        />
      )}
    </>
  );
}
