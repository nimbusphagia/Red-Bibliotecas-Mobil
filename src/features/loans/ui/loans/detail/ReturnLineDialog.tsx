import { returnCopies } from "@/features/loans/internal/loan/service";
import type { LoanLine } from "@/features/loans/internal/loan/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogHeader,
  FieldError,
  Text,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
import { View } from "react-native";

type Item = Parameters<typeof returnCopies>[1]["items"][number];
type Choice = { key: string; label: string; item: Omit<Item, "copyId"> };

const CHOICES: Choice[] = [
  { key: "ok", label: "Bien", item: { outcome: "returned" } },
  {
    key: "damaged",
    label: "Dañado pero funcional",
    item: { outcome: "returned_damaged" },
  },
  {
    key: "irreparable",
    label: "Irreparablemente dañado",
    item: { outcome: "lost", reason: "discard" },
  },
  {
    key: "lost",
    label: "Perdido",
    item: { outcome: "lost", reason: "loss" },
  },
];

// En este orden: el primero es el elegido por defecto.
const REPORT_KEYS = ["lost", "irreparable"];

type Props = {
  line: LoanLine;
  actorId: number;
  reportOnly?: boolean;
  onClose: () => void;
  onDone: () => void;
};

export default function ReturnLineDialog({
  line,
  actorId,
  reportOnly = false,
  onClose,
  onDone,
}: Props) {
  const choices = reportOnly
    ? REPORT_KEYS.map((k) => CHOICES.find((c) => c.key === k)!)
    : CHOICES;
  const [selected, setSelected] = useState(choices[0].key);
  const { errors, submitting, run } = useFormSubmit();

  const confirm = () =>
    run(async () => {
      const { item } = choices.find((c) => c.key === selected)!;
      await returnCopies(actorId, {
        items: [{ copyId: line.copyId, ...item }],
      });
      onDone();
    });

  const error = errors.form ?? Object.values(errors.fields)[0];

  return (
    <Dialog size="sm" onClose={onClose}>
      <DialogHeader
        title={`#${line.copyId} ${line.bookTitle}`}
        subtitle={line.labelText ?? undefined}
      />
      <View className="mb-2 gap-4">
        <Text variant="section" className="mb-1 font-sans">
          {reportOnly ? "Reportar incidencia" : "Estado del ejemplar"}
        </Text>
        {choices.map((c) => (
          <Button
            key={c.key}
            title={c.label}
            variant={c.key === selected ? "accent" : "soft"}
            onPress={() => setSelected(c.key)}
          />
        ))}
      </View>
      <FieldError>{error}</FieldError>
      <DialogActions
        className="justify-between"
        confirmTitle="Confirmar"
        loading={submitting}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
