import { useSession } from "@/features/account/internal/session";
import {
  getCopy,
  markCopiesLabeled,
} from "@/features/inventory/internal/copy/service";
import type {
  CopyItem,
  MarkLabeledResult,
} from "@/features/inventory/internal/copy/types";
import { markFailureText } from "@/features/shared/format/translate";
import {
  Button,
  Dialog,
  FieldError,
  FormHeader,
  LabeledItem,
  Panel,
  SplitColumns,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { Printer } from "lucide-react-native";
import { useEffect, useState } from "react";
import LabelCopyPicker from "./labels/form/LabelCopyPicker";
import LabelCopyTable from "./labels/form/LabelCopyTable";
import LabelResultDialog from "./labels/form/LabelResultDialog";
import { usePrintLabels } from "./labels/form/usePrintLabels";
import { labelStateOf } from "./labels/labelState";

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

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
  const printer = usePrintLabels();

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

  const leave = () => router.back();

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
        title="Etiquetar ejemplares"
        submitTitle="Marcar como etiquetado"
        submitting={submitting}
        canSubmit={copies.length > 0}
        onSubmit={submit}
        onCancel={() => router.back()}
        extra={
          <Button
            icon={Printer}
            accessibilityLabel="Imprimir etiqueta"
            variant="soft"
            loading={printer.printing}
            disabled={copies.length === 0 || submitting}
            onPress={() => printer.print(copies)}
          />
        }
      />
      <ScreenBody form>
        <FieldError>{errors.form ?? printer.error}</FieldError>
        <SplitColumns>
          <Panel title="Detalles">
            <LabeledItem
              label="Encargado"
              content={
                session.status === "signed-in"
                  ? session.account.username
                  : undefined
              }
              labelWidth="formWide"
            />
            <LabeledItem
              label="Seleccionados"
              content={String(copies.length)}
              labelWidth="formWide"
            />
            <LabeledItem
              label="Desactualizados"
              content={String(outdated)}
              labelWidth="formWide"
            />
            <LabeledItem
              label="Fecha"
              content={formatDateES(new Date())}
              labelWidth="formWide"
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
          title={
            result.value.failed.length
              ? "Algunos ejemplares no se etiquetaron"
              : "Listo"
          }
          subtitle={`${plural(result.value.labeled.length, "etiquetado", "etiquetados")}${
            result.value.alreadyLabeled.length
              ? ` · ${plural(result.value.alreadyLabeled.length, "ya estaba al día", "ya estaban al día")}`
              : ""
          }`}
          problems={result.value.failed.map((f) => {
            const c = result.attempted.find((x) => x.id === f.copyId);
            return {
              copyId: f.copyId,
              name: c?.labelText ?? c?.bookTitle ?? "",
              reason: markFailureText(f),
            };
          })}
          note={
            result.value.failed.length
              ? "Siguen en la lista para que los corrijas y vuelvas a intentarlo."
              : undefined
          }
          onClose={closeResult}
        />
      )}
      {printer.dialog}
    </>
  );
}
