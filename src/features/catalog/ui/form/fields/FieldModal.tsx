import { createCollection } from "@/features/catalog/internal/collection/service";
import { createPublisher } from "@/features/catalog/internal/publisher/service";
import { createSeries } from "@/features/catalog/internal/series/service";
import {
  Dialog,
  DialogActions,
  DialogBody,
  FieldError,
  MultiSearchSelect,
  SearchSelect,
  SimpleSelect,
  TextField,
  type Option,
} from "@/features/shared/components";
import { toFormErrors } from "@/features/shared/errors/messages";
import { useCallback, useState } from "react";
import {
  searchAuthors,
  searchCollections,
  searchSeries,
  useOptions,
} from "../../options";
import { display, type Field } from "./fields";
import NewAuthorForm from "./NewAuthorForm";
import type { BookFormValues } from "./values";

type Props = {
  field: Field;
  values: BookFormValues;
  onChange: (patch: Partial<BookFormValues>) => void;
  onClose: () => void;
};

export default function FieldModal({
  field,
  values,
  onChange,
  onClose,
}: Props) {
  const { key, kind, label } = field;
  const [draft, setDraft] = useState(() => display(values[key]) ?? "");
  const [error, setError] = useState<string>();
  const [newAuthor, setNewAuthor] = useState<string | null>(null);
  const options = useOptions(field.load ?? null);

  const publisherId = values.publisher?.id;
  const fetchCollections = useCallback(
    (search: string) => searchCollections(search, publisherId),
    [publisherId],
  );

  // Una serie debe ser de un escritor o ilustrador del libro.
  const authorKey = [...values.writers, ...values.illustrators]
    .map((a) => a.id)
    .join(",");
  const fetchSeries = useCallback(
    (search: string) =>
      searchSeries(search, authorKey ? authorKey.split(",").map(Number) : []),
    [authorKey],
  );

  const commit = (value: BookFormValues[keyof BookFormValues]) =>
    onChange({ [key]: value } as Partial<BookFormValues>);
  const pick = (option?: Option) => {
    commit(option);
    onClose();
  };
  const fail = (e: unknown) => {
    const f = toFormErrors(e);
    setError(f.form ?? Object.values(f.fields)[0]);
  };

  const n = Number(draft);
  const valid =
    draft.trim() === ""
      ? field.required !== true
      : (field.min === undefined || n >= field.min) &&
        (field.max === undefined || n <= field.max);
  const confirm = () => {
    if (!valid) return;
    commit(draft.trim());
    onClose();
  };

  async function create(name: string) {
    setError(undefined);
    try {
      if (key === "publisher") {
        const p = await createPublisher({ name });
        pick({ id: p.id, label: p.name });
      } else if (key === "collection" && publisherId) {
        const c = await createCollection({ name, publisherId });
        pick({ id: c.id, label: c.name });
      } else if (key === "series") {
        const author = values.writers[0];
        if (!author) return setError("Elige primero un escritor");
        const s = await createSeries({ name, authorId: author.id });
        pick({ id: s.id, label: `${s.name} · ${author.label}` });
      }
    } catch (e) {
      fail(e);
    }
  }

  return (
    <Dialog onClose={onClose}>
      {newAuthor !== null ? (
        <NewAuthorForm
          initialName={newAuthor}
          onCancel={() => setNewAuthor(null)}
          onCreated={(author) => {
            commit([...(values[key] as Option[]), author]);
            setNewAuthor(null);
          }}
        />
      ) : (
        <>
          <DialogBody>
            {(kind === "text" || kind === "number") && (
              <TextField
                label={label}
                value={draft}
                onChangeText={(t) =>
                  setDraft(kind === "number" ? t.replace(/\D/g, "") : t)
                }
                keyboardType={kind === "number" ? "number-pad" : "default"}
                autoCapitalize={key === "title" ? "words" : "none"}
                helperText={
                  field.max
                    ? `Entre ${field.min ?? 0} y ${field.max}`
                    : undefined
                }
                onSubmitEditing={confirm}
                autoFocus
              />
            )}

            {kind === "pick" && (
              <SimpleSelect
                label={label}
                options={options}
                value={(values[key] as Option | undefined)?.id}
                onChange={(id) => pick(options.find((o) => o.id === id))}
              />
            )}

            {kind === "search" && (
              <SearchSelect
                label={label}
                initiallyOpen
                value={values[key] as Option | undefined}
                onChange={pick}
                fetchOptions={
                  key === "collection"
                    ? fetchCollections
                    : key === "series"
                      ? fetchSeries
                      : field.fetch!
                }
                placeholder="Ninguna"
                onCreate={create}
              />
            )}

            {kind === "multi" && (
              <MultiSearchSelect
                label={label}
                values={values[key] as Option[]}
                onChange={commit}
                fetchOptions={searchAuthors}
                placeholder="Agregar..."
                onCreate={setNewAuthor}
              />
            )}
          </DialogBody>

          <FieldError>{error}</FieldError>

          {(kind === "text" || kind === "number") && (
            <DialogActions
              confirmTitle="Aceptar"
              disabled={!valid}
              onConfirm={confirm}
              onCancel={onClose}
            />
          )}
          {kind === "multi" && (
            <DialogActions confirmTitle="Listo" onConfirm={onClose} />
          )}
        </>
      )}
    </Dialog>
  );
}
