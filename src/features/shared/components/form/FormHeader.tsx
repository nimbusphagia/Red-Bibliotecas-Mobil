import { Button } from "../base/Button";
import { PageHeader } from "../base/Header";
import { Surface } from "../base/Surface";

type Props = {
  title: string;
  subtitle?: string;
  submitTitle: string;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function FormHeader({
  title,
  subtitle,
  submitTitle,
  submitting,
  canSubmit,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <PageHeader title={title} subtitle={subtitle}>
      <Surface tone="dark" className="flex-row gap-4 rounded-lg p-2">
        <Button title="Cancelar" variant="soft" onPress={onCancel} />
        <Button
          variant="accent"
          title={submitTitle}
          loading={submitting}
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      </Surface>
    </PageHeader>
  );
}
