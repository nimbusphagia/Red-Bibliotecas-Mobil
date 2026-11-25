import { useSession } from "@/features/account/internal/session";
import {
  EMPTY_VALUES,
  type BookFormValues,
} from "@/features/catalog/ui/form/fields/values";
import { loadShelves, useOptions } from "@/features/catalog/ui/options";
import {
  ENTRY_REASONS,
  MAX_LINES,
} from "@/features/inventory/internal/movement/schemas";
import { registerCopies } from "@/features/inventory/internal/movement/service";
import type { EntryReason } from "@/features/inventory/internal/movement/types";
import {
  Button,
  FieldError,
  FieldRow,
  FormHeader,
  LabeledItem,
  NotesDialog,
  Panel,
  SimpleSelect,
  SplitColumns,
} from "@/features/shared/components";
import { toLineErrors } from "@/features/shared/errors/messages";
import { formatDate } from "@/features/shared/format/dates";
import { MOVEMENT_REASON_ES } from "@/features/shared/format/translate";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import EntryImportDialog from "./entry/import/EntryImportDialog";
import EntryLineTable from "./entry/EntryLineTable";
import ExistingBookDialog from "./entry/ExistingBookDialog";
import { lineQuantity, toLineInput, type EntryLine } from "./entry/lines";
import NewBookLineForm from "./entry/NewBookLineForm";
import { Plus, Search, Upload } from "lucide-react-native";

const REASON_OPTIONS = ENTRY_REASONS.map((r) => ({
  id: r,
  label: MOVEMENT_REASON_ES[r],
}));

type Editing =
  | { type: "notes" }
  | { type: "existing"; index?: number }
  | { type: "new"; index?: number }
  | { type: "import" }
  | null;

export default function EntryForm() {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const { isExpanded } = useLayoutMode();
  const shelves = useOptions(loadShelves);
  const [reason, setReason] = useState<EntryReason>("purchase");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<EntryLine[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const nextKey = useRef(0);

  const defaultShelf = shelves[0];
  const copies = lines.reduce((n, l) => n + lineQuantity(l), 0);
  const close = () => setEditing(null);

  const save = (index: number | undefined, line: EntryLine) =>
    setLines((p) =>
      index === undefined
        ? [...p, line]
        : p.map((l, i) => (i === index ? line : l)),
    );
  const nextLineKey = () => nextKey.current++;
  const addImported = (books: BookFormValues[]) => {
    setLines((p) => [
      ...p,
      ...books.map((values) => ({
        key: nextLineKey(),
        kind: "new" as const,
        values,
      })),
    ]);
    close();
  };

  const submit = () => {
    if (session.status !== "signed-in" || !reason) return;
    // Los errores de un intento anterior ya no valen.
    setLines((p) => p.map(({ error: _e, ...l }) => l as EntryLine));
    run(
      async () => {
        const { movement } = await registerCopies(session.account.id, {
          reason,
          notes,
          lines: lines.map(toLineInput),
        });
        router.replace(`/stock/${movement.id}`);
      },
      (_e, raw) => {
        const { lineIndex, errors: lineErrors } = toLineErrors(raw);
        if (lineIndex === undefined) return;
        const suggested = lineErrors.suggestedOmitWords;
        setLines((p) =>
          p.map((l, i) => {
            if (i !== lineIndex) return l;
            if (l.kind === "new" && suggested?.length) {
              return {
                ...l,
                error: lineErrors,
                values: { ...l.values, omitWords: suggested.join(", ") },
              };
            }
            return { ...l, error: lineErrors };
          }),
        );
      },
    );
  };

  if (editing?.type === "new") {
    const current =
      editing.index === undefined ? undefined : lines[editing.index];
    const initial: BookFormValues =
      current?.kind === "new"
        ? current.values
        : { ...EMPTY_VALUES, shelf: defaultShelf };
    return (
      <NewBookLineForm
        initial={initial}
        errors={current?.error}
        isNew={current === undefined}
        onCancel={close}
        onSave={(values) => {
          save(editing.index, {
            key: current?.key ?? nextLineKey(),
            kind: "new",
            values,
          });
          close();
        }}
      />
    );
  }

  const existing =
    editing?.type === "existing" && editing.index !== undefined
      ? lines[editing.index]
      : undefined;

  const editLine = (index: number) =>
    setEditing({ type: lines[index].kind, index });

  const notesField = (
    <FieldRow
      label="Notas"
      value={notes || undefined}
      error={errors.fields.notes}
      onPress={() => setEditing({ type: "notes" })}
    />
  );

  return (
    <>
      <FormHeader
        title="Registrar entrada"
        submitTitle="Registrar"
        submitting={submitting}
        canSubmit={!!reason && lines.length > 0}
        onSubmit={submit}
        onCancel={() => router.back()}
      />
      <ScreenBody form>
        <FieldError>{errors.form}</FieldError>
        <Panel title="Detalles">
          <SplitColumns>
            <View className="gap-2">
              <LabeledItem
                label="Encargado"
                content={
                  session.status === "signed-in"
                    ? session.account.username
                    : undefined
                }
                labelWidth="form"
              />
              <LabeledItem
                label="Fecha"
                content={formatDate(new Date())}
                labelWidth="form"
              />
              {isExpanded && notesField}
            </View>
            <View className="gap-2">
              <LabeledItem
                label="Libros"
                content={String(lines.length)}
                labelWidth="form"
              />
              <LabeledItem
                label="Ejemplares"
                content={String(copies)}
                labelWidth="form"
              />
              {!isExpanded && notesField}
              <View className="mt-4 mb-2 gap-1">
                <SimpleSelect
                  label="Motivo *"
                  options={REASON_OPTIONS}
                  value={reason}
                  onChange={(r) => r && setReason(r)}
                />
                <FieldError>{errors.fields.reason}</FieldError>
              </View>
            </View>
          </SplitColumns>
        </Panel>

        <Panel
          title="Libros"
          lead={
            <View className="flex-1 flex-row justify-between">
              <Button
                title="Existente"
                variant="soft"
                icon={Search}
                size="sm"
                onPress={() => setEditing({ type: "existing" })}
              />
              <View className="flex-row gap-2">
                <Button
                  title="Importar"
                  variant="soft"
                  icon={Upload}
                  size="sm"
                  onPress={() => setEditing({ type: "import" })}
                />
                <Button
                  title="Nuevo"
                  icon={Plus}
                  size="sm"
                  onPress={() => setEditing({ type: "new" })}
                />
              </View>
            </View>
          }
        >
          <EntryLineTable
            lines={lines}
            error={errors.fields.lines}
            onEdit={editLine}
            onRemove={(i) => setLines((p) => p.filter((_, x) => x !== i))}
          />
        </Panel>
      </ScreenBody>

      {editing?.type === "notes" && (
        <NotesDialog value={notes} onChange={setNotes} onClose={close} />
      )}
      {editing?.type === "import" && (
        <EntryImportDialog
          room={MAX_LINES - lines.length}
          onLoad={addImported}
          onClose={close}
        />
      )}
      {editing?.type === "existing" && (
        <ExistingBookDialog
          initial={existing?.kind === "existing" ? existing : undefined}
          takenIds={lines.flatMap((l, i) =>
            l.kind === "existing" && i !== editing.index ? [l.book.id] : [],
          )}
          shelves={shelves}
          error={existing?.error && Object.values(existing.error.fields)[0]}
          onClose={close}
          onSave={(value) => {
            save(editing.index, {
              key: existing?.key ?? nextLineKey(),
              kind: "existing",
              ...value,
            });
            close();
          }}
        />
      )}
    </>
  );
}
