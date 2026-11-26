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
  FieldError,
  FormHeader,
  LabeledItem,
  Panel,
  SplitColumns,
  Surface,
  Text,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { Info, Printer } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import LabelCopySelector from "./labels/form/LabelCopySelector";
import LabelResultDialog from "./labels/form/LabelResultDialog";
import { usePrintLabels } from "./labels/form/usePrintLabels";
import { labelStateOf } from "./labels/labelState";

const STEPS = [
  "Elige los ejemplares que necesiten ser etiquetados.",
  "Haz click en el botón «Imprimir» para generar la hoja de tejuelos. Puedes guardar o imprimir los tejuelos cuantas veces quieras, esta acción no afecta al sistema.",
  "Después de pegar cada tejuelo en su ejemplar, presiona «Actualizar» para que el sistema guarde su estado.",
];

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export default function LabelForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, setErrors, submitting, run, release } = useFormSubmit();
  const [copies, setCopies] = useState<CopyItem[]>([]);
  const loadMore = useRef<() => void>(undefined);
  const [result, setResult] = useState<{
    value: MarkLabeledResult;
    attempted: CopyItem[];
  }>();
  const printer = usePrintLabels();
  const { isExpanded } = useLayoutMode();

  useEffect(() => {
    if (copyId)
      getCopy(Number(copyId))
        .then((c) => setCopies([c]))
        .catch(() =>
          setErrors({ form: "No se pudo cargar el ejemplar", fields: {} }),
        );
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
      release();
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
        submitTitle="Actualizar"
        submitting={submitting}
        canSubmit={copies.length > 0}
        onSubmit={submit}
        onCancel={() => router.back()}
        extra={
          <Button
            icon={Printer}
            title={isExpanded ? "Imprimir tejuelos" : "Imprimir"}
            variant="soft"
            loading={printer.printing}
            disabled={copies.length === 0 || submitting}
            onPress={() => printer.print(copies)}
          />
        }
      />
      <ScreenBody form onEndReached={() => loadMore.current?.()}>
        <FieldError>{errors.form ?? printer.error}</FieldError>
        <View className="gap-6">
          <SplitColumns>
            <Panel
              title="Instrucciones"
              subtitle="Imprimir tejuelos y actualizar el estado de los ejemplares"
              icon={Info}
            >
              <Surface inset className="gap-2 p-4">
                {STEPS.map((step, i) => (
                  <Text key={i} variant="itemSm">
                    {i + 1}. {step}
                  </Text>
                ))}
              </Surface>
            </Panel>
            {isExpanded && (
              <Panel title="Detalles">
                <LabeledItem
                  label="Encargado"
                  content={
                    session.status === "signed-in"
                      ? session.account.name
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
                  accent={outdated > 0 ? "neg" : undefined}
                  labelWidth="formWide"
                />
                <LabeledItem
                  label="Fecha"
                  content={formatDateES(new Date())}
                  labelWidth="formWide"
                />
              </Panel>
            )}
          </SplitColumns>

          <LabelCopySelector
            selected={copies}
            onToggle={toggle}
            error={errors.fields.copyIds}
            loadMoreRef={loadMore}
          />
        </View>
      </ScreenBody>

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
