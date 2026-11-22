import type {
  CopyItem,
  MarkLabeledResult,
} from "@/features/inventory/internal/copy/types";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  Text,
} from "@/features/shared/components";
import { markFailureText } from "@/features/shared/format/translate";
import { View } from "react-native";

type Props = {
  result: MarkLabeledResult;
  /** Los ejemplares que se intentaron marcar, para mostrar su tejuelo. */
  copies: CopyItem[];
  onClose: () => void;
};

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export default function LabelResultDialog({ result, copies, onClose }: Props) {
  const byId = new Map(copies.map((c) => [c.id, c]));
  const { labeled, alreadyLabeled, failed } = result;

  return (
    <Dialog onClose={onClose} size="md">
      <DialogHeader
        title={failed.length ? "Algunos ejemplares no se etiquetaron" : "Listo"}
        subtitle={`${plural(labeled.length, "etiquetado", "etiquetados")}${
          alreadyLabeled.length
            ? ` · ${plural(alreadyLabeled.length, "ya estaba al día", "ya estaban al día")}`
            : ""
        }`}
      />
      {failed.length > 0 && (
        <DialogBody>
          {failed.map((f) => {
            const c = byId.get(f.copyId);
            return (
              <View key={f.copyId} className="gap-0.5">
                <Text variant="item">
                  #{f.copyId}
                  {c ? ` · ${c.labelText ?? c.bookTitle}` : ""}
                </Text>
                <Text variant="caption">{markFailureText(f)}</Text>
              </View>
            );
          })}
          <Text variant="caption">
            Siguen en la lista para que los corrijas y vuelvas a intentarlo.
          </Text>
        </DialogBody>
      )}
      <DialogActions confirmTitle="Entendido" onConfirm={onClose} />
    </Dialog>
  );
}
