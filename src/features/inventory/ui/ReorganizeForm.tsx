import { useSession } from "@/features/account/internal/session";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  getShelf,
  getShelfSummary,
  moveCopies,
} from "@/features/inventory/internal/shelf/service";
import CopySelector from "@/features/inventory/ui/picker/CopySelector";
import {
  FieldError,
  FieldRow,
  FormHeader,
  LabeledItem,
  Panel,
  type Option,
} from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { ShelvingUnit } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { PickShelfDialog } from "./shelves/form/ReorganizeDialogs";

export default function ReorganizeForm() {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [target, setTarget] = useState<Option>();
  const [copies, setCopies] = useState<CopyItem[]>([]);
  const loadMore = useRef<() => void>(undefined);
  const [editing, setEditing] = useState<"target" | null>(null);
  const [targetInfo, setTargetInfo] = useState<{
    description: string | null;
    total: number;
  }>();

  useEffect(() => {
    setTargetInfo(undefined);
    if (!target) return;
    let live = true;
    void Promise.all([getShelf(target.id), getShelfSummary(target.id)]).then(
      ([shelf, summary]) =>
        live &&
        setTargetInfo({ description: shelf.description, total: summary.total }),
    );
    return () => {
      live = false;
    };
  }, [target]);

  const targetId = target?.id;
  const pending = copies.filter((c) => c.shelfId !== targetId).length;

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
    void run(async () => {
      await moveCopies(session.account.id, {
        shelfId: target.id,
        copyIds: copies.map((c) => c.id),
      });
      router.replace(`/shelves/${target.id}`);
    });
  };

  const toggleCopy = (c: CopyItem) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );

  const stateOf = useCallback(
    (c: CopyItem) => ({
      icon: ShelvingUnit,
      text:
        c.shelfId === targetId
          ? "Ya está en el destino"
          : shelfLabel({ name: c.shelfName, isDefault: c.shelfIsDefault }),
    }),
    [targetId],
  );
  const inTarget = useCallback(
    (c: CopyItem) => c.shelfId === targetId,
    [targetId],
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
      <ScreenBody form onEndReached={() => loadMore.current?.()}>
        <FieldError>{errors.form}</FieldError>
        <Panel title="Estantería">
          <FieldRow
            label="Mover a *"
            labelWidth="formWide"
            value={target?.label}
            error={errors.fields.shelfId}
            onPress={() => setEditing("target")}
          />
          <LabeledItem
            label="Descripción"
            content={targetInfo?.description ?? undefined}
            labelWidth="formWide"
          />
          <LabeledItem
            label="Ejemplares"
            content={targetInfo && String(targetInfo.total)}
            labelWidth="formWide"
          />
          <LabeledItem
            label="Seleccionados"
            content={String(pending)}
            labelWidth="formWide"
          />
        </Panel>

        <CopySelector
          anyStatus
          selected={copies}
          onToggle={toggleCopy}
          stateOf={stateOf}
          disabled={inTarget}
          error={copyError}
          loadMoreRef={loadMore}
        />
      </ScreenBody>

      {editing === "target" && (
        <PickShelfDialog
          value={target}
          onChange={setTarget}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
