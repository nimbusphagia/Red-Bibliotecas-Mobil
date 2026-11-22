import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  Text,
} from "@/features/shared/components";
import { View } from "react-native";

export type Problem = { copyId: number; name: string; reason: string };

type Props = {
  title: string;
  subtitle?: string;
  problems: Problem[];
  note?: string;
  onClose: () => void;
};

/** Resultado de una acción por lote: qué ejemplares no se pudieron y por qué. */
export default function LabelResultDialog({
  title,
  subtitle,
  problems,
  note,
  onClose,
}: Props) {
  return (
    <Dialog onClose={onClose} size="md">
      <DialogHeader title={title} subtitle={subtitle} />
      {(problems.length > 0 || note) && (
        <DialogBody>
          {problems.map((p) => (
            <View key={p.copyId} className="gap-0.5">
              <Text variant="item">
                #{p.copyId} · {p.name}
              </Text>
              <Text variant="caption">{p.reason}</Text>
            </View>
          ))}
          {note && <Text variant="caption">{note}</Text>}
        </DialogBody>
      )}
      <DialogActions confirmTitle="Entendido" onConfirm={onClose} />
    </Dialog>
  );
}
