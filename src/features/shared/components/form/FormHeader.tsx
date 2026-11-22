import { Button } from "../base/Button";
import { PageHeader } from "../base/Header";

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
      <Button title="Cancelar" variant="soft" onPress={onCancel} />
      <Button
        variant="soft"
        title={submitTitle}
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
      />
    </PageHeader>
  );
}
