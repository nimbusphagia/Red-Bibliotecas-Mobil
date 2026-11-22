import { useSession } from "@/features/account/internal/session";
import {
  getCopy,
  markCopiesLabeled,
} from "@/features/inventory/internal/copy/service";
import type {
  CopyItem,
  MarkLabeledResult,
} from "@/features/inventory/internal/copy/types";
import {
  Button,
  Dialog,
  FieldError,
  FormHeader,
  LabeledItem,
  Panel,
  SplitColumns,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LabelCopyPicker from "./labels/form/LabelCopyPicker";
import LabelCopyTable from "./labels/form/LabelCopyTable";
import LabelResultDialog from "./labels/form/LabelResultDialog";
import { labelStateOf } from "./labels/labelState";

export default function LabelForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [copies, setCopies] = useState<CopyItem[]>([]);
  const [picking, setPicking] = useState(false);
  const [result, setResult] = useState<{
    value: MarkLabeledResult;
    attempted: CopyItem[];
  }>();

  useEffect(() => {
    if (copyId)
      getCopy(Number(copyId))
        .then((c) => setCopies([c]))
        .catch(() => {});
  }, [copyId]);

  const toggle = (c: CopyItem) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );

  const leave = () => router.replace("/labels");

  const submit = () => {
    if (session.status !== "signed-in") return;
    run(async () => {
      const attempted = copies;
      const value = await markCopiesLabeled(session.account.id, {
        copyIds: attempted.map((c) => c.id),
      });
      if (value.failed.length === 0 && value.alreadyLabeled.length === 0) {
        leave();
        return;
      }
      // Quedan en la lista solo los que fallaron, para corregirlos y reintentar.
      const failedIds = new Set(value.failed.map((f) => f.copyId));
      setCopies(attempted.filter((c) => failedIds.has(c.id)));
      setResult({ value, attempted });
    });
  };

  const closeResult = () => {
    setResult(undefined);
    if (copies.length === 0) leave();
  };

  const outdated = copies.filter((c) => labelStateOf(c) === "outdated").length;

  return (
    <>
      <FormHeader
        title="Etiquetar tejuelos"
        submitTitle="Marcar como etiquetado"
        submitting={submitting}
        canSubmit={copies.length > 0}
        onSubmit={submit}
        onCancel={() => router.back()}
        extra={<Button title="Imprimir etiqueta" variant="soft" disabled />}
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
              label="Desactualizados"
              content={String(outdated)}
              labelWidth="form"
            />
            <LabeledItem
              label="Registro"
              content={formatDate(new Date())}
              labelWidth="form"
            />
          </Panel>

          <Panel
            title="Ejemplares"
            lead={
              <Button
                title="Agregar"
                size="sm"
                onPress={() => setPicking(true)}
              />
            }
          >
            <LabelCopyTable
              copies={copies}
              error={errors.fields.copyIds}
              onRemove={(id) => setCopies((p) => p.filter((c) => c.id !== id))}
            />
          </Panel>
        </SplitColumns>
      </ScreenBody>

      {picking && (
        <Dialog onClose={() => setPicking(false)} size="lg" tone="canvas">
          <LabelCopyPicker
            className="flex-1"
            selected={copies}
            onToggle={toggle}
          />
        </Dialog>
      )}
      {result && (
        <LabelResultDialog
          result={result.value}
          copies={result.attempted}
          onClose={closeResult}
        />
      )}
    </>
  );
}
