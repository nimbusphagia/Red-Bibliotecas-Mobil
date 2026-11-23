import type { ReactNode } from "react";
import { View } from "react-native";
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
  /** Acción extra junto al título. */
  extra?: ReactNode;
};

export function FormHeader({
  title,
  subtitle,
  submitTitle,
  submitting,
  canSubmit,
  onSubmit,
  onCancel,
  extra,
}: Props) {
  return (
    <PageHeader title={title} subtitle={subtitle}>
      <View className="flex-1 flex-row items-center gap-4">
        {extra}
        <View className="ml-auto flex-row items-center gap-4">
          <Button title="Cancelar" variant="soft" onPress={onCancel} />
          <Button
            title={submitTitle}
            loading={submitting}
            disabled={!canSubmit}
            onPress={onSubmit}
          />
        </View>
      </View>
    </PageHeader>
  );
}
