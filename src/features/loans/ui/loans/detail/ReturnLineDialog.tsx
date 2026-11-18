import { returnCopies } from "@/features/loans/internal/loan/service";
import type { LoanLine } from "@/features/loans/internal/loan/types";
import { Button, Dialog, FieldError, Text } from "@/features/shared/components";
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

const REPORT_KEYS = ["irreparable", "lost"];

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
    ? CHOICES.filter((c) => REPORT_KEYS.includes(c.key))
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
    <Dialog onClose={onClose}>
      <Text variant="h3" className="font-sans-semibold">
        {reportOnly ? "Reportar ejemplar" : "Devolver ejemplar"}
      </Text>
      <Text variant="subtitle">
        {line.bookTitle} {line.labelText ? `· ${line.labelText}` : ""}
      </Text>
      <View className="gap-2">
        <Text variant="subtitle">Estado del ejemplar</Text>
        {choices.map((c) => (
          <Button
            key={c.key}
            title={c.label}
            variant={c.key === selected ? "primary" : "secondary"}
            onPress={() => setSelected(c.key)}
          />
        ))}
      </View>
      <FieldError>{error}</FieldError>
      <View className="flex-row justify-end gap-5">
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
        <Button title="Confirmar" loading={submitting} onPress={confirm} />
      </View>
    </Dialog>
  );
}
