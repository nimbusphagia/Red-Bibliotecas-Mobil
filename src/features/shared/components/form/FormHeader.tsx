import { Button } from "../base/Button";
import { PageHeader } from "../base/Header";

type Props = {
  title: string;
  submitTitle: string;
  submitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function FormHeader({
  title,
  submitTitle,
  submitting,
  canSubmit,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <PageHeader title={title}>
      <Button title="Cancelar" variant="secondary" onPress={onCancel} />
      <Button
        title={submitTitle}
        loading={submitting}
        disabled={!canSubmit}
        onPress={onSubmit}
      />
    </PageHeader>
  );
}
