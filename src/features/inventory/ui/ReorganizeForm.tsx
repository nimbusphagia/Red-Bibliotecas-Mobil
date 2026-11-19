import { useSession } from "@/features/account/internal/session";
import { moveCopies } from "@/features/inventory/internal/shelf/service";
import {
  Button,
  Divider,
  FieldError,
  FieldRow,
  FormHeader,
  FormSection,
  type Option,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import MoveCopyTable from "./shelves/form/MoveCopyTable";
import {
  CopySearchDialog,
  PickShelfDialog,
} from "./shelves/form/ReorganizeDialogs";
import type { MoveCopy } from "./shelves/options";

export default function ReorganizeForm() {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const { isExpanded } = useLayoutMode();
  const [target, setTarget] = useState<Option>();
  const [copies, setCopies] = useState<MoveCopy[]>([]);
  const [editing, setEditing] = useState<"target" | "copies" | null>(null);
  const close = () => setEditing(null);

  const pending = copies.filter((c) => c.shelfId !== target?.id).length;

  const copyError =
    Object.entries(errors.fields)
      .filter(([key]) => key.startsWith("copyIds"))
      .map(([key, message]) => {
        const c = copies[Number(key.split(".")[1])];
        return c ? `${c.labelText ?? `#${c.id}`}: ${message}` : message;
      })
      .join("\n") || undefined;

  const submit = () => {
    if (session.status !== "signed-in" || !target) return;
    run(async () => {
      await moveCopies(session.account.id, {
        shelfId: target.id,
        copyIds: copies.map((c) => c.id),
      });
      router.replace(`/shelves/${target.id}`);
    });
  };

  const removeCopy = (id: number) =>
    setCopies((p) => p.filter((c) => c.id !== id));

  const toggleCopy = (c: MoveCopy) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );

  return (
    <>
      <FormHeader
        title="Reorganizar"
        submitTitle="Mover"
        submitting={submitting}
        canSubmit={!!target && pending > 0}
        onSubmit={submit}
        onCancel={() => router.back()}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pt-7"
        keyboardShouldPersistTaps="handled"
      >
        <FieldError>{errors.form}</FieldError>
        <View className={cn("gap-8", isExpanded && "flex-row")}>
          <FormSection
            title="Detalles"
            className={isExpanded ? "flex-1" : undefined}
          >
            <FieldRow
              label="Destino *"
              value={target?.label}
              error={errors.fields.shelfId}
              onPress={() => setEditing("target")}
            />
          </FormSection>

          <Divider vertical={isExpanded} />

          <FormSection
            title="Ejemplares"
            className={isExpanded ? "flex-1" : undefined}
            lead={
              <Button
                variant="secondary"
                title="Agregar"
                onPress={() => setEditing("copies")}
              />
            }
          >
            <MoveCopyTable
              copies={copies}
              targetId={target?.id}
              error={copyError}
              onRemove={removeCopy}
            />
          </FormSection>
        </View>
      </ScrollView>

      {editing === "target" && (
        <PickShelfDialog value={target} onChange={setTarget} onClose={close} />
      )}

      {editing === "copies" && (
        <CopySearchDialog
          selected={copies}
          onToggle={toggleCopy}
          onClose={close}
        />
      )}
    </>
  );
}
