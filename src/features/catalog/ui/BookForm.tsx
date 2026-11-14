import { useSession } from "@/features/account/internal/session";
import {
  getBookItem,
  updateBook,
} from "@/features/catalog/internal/book/service";
import type { BookListItem } from "@/features/catalog/internal/book/types";
import { registerCopies } from "@/features/inventory/internal/movement/service";
import {
  Button,
  FieldRow,
  PageHeader,
  Text,
  type Option,
} from "@/features/shared/components";
import {
  toFormErrors,
  type FormErrors,
} from "@/features/shared/errors/messages";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useRouter } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import FieldModal from "./formComponents/FieldModal";
import { COLUMNS, display, type Field } from "./formComponents/fields";
import InlinePick from "./formComponents/InlinePick";
import {
  EMPTY_VALUES,
  fromBook,
  toBookInput,
  type BookFormValues,
} from "./formComponents/values";

export default function BookForm({ id }: { id?: string }) {
  const [book, setBook] = useState<BookListItem>();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getBookItem(routeIdSchema.parse(id)).then((b) => {
      if (!cancelled) setBook(b);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (id && !book) return <ActivityIndicator />;
  return <Form key={book?.id} book={book} />;
}

function Form({ book }: { book?: BookListItem }) {
  const router = useRouter();
  const session = useSession();
  const { isExpanded } = useLayoutMode();

  const [v, setValues] = useState(() => (book ? fromBook(book) : EMPTY_VALUES));
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);

  const isEdit = !!book;
  const locked = (book?.copyCount ?? 0) > 0;

  const columns = COLUMNS.map((groups) =>
    groups.filter((g) => !g.createOnly || !isEdit),
  );
  const fields = columns.flat().flatMap((g) => g.fields);

  const isRequired = (f: Field) =>
    f.required === true || (f.required === "create" && !isEdit);
  const canSubmit = fields
    .filter(isRequired)
    .every((f) => display(v[f.key]) !== null);

  const isVisible = (f: Field) =>
    f.key !== "omitWords" ||
    errors.fields.omitWords !== undefined ||
    v.omitWords !== "";

  const set = (patch: Partial<BookFormValues>) =>
    setValues((p) => ({
      ...p,
      ...patch,
      ...("publisher" in patch &&
        patch.publisher?.id !== p.publisher?.id && { collection: undefined }),
    }));

  const onFieldChange = (patch: Partial<BookFormValues>) => {
    set(patch);
    setErrors({ fields: {} });
  };

  async function submit() {
    if (submitting || session.status !== "signed-in") return;
    setErrors({ fields: {} });
    setSubmitting(true);
    try {
      if (book) {
        await updateBook(book.id, toBookInput(v));
        router.back();
        return;
      }
      const { lines } = await registerCopies(session.account.id, {
        shelfId: v.shelf?.id,
        lines: [
          {
            book: toBookInput(v),
            quantity: Number(v.quantity) || 1,
            omitWords: v.omitWords
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean),
          },
        ],
      });
      router.replace(`/catalog/${lines[0].bookId}`);
    } catch (error) {
      const e = toFormErrors(error);
      setErrors(e);
      if (e.suggestedOmitWords?.length) {
        set({ omitWords: e.suggestedOmitWords.join(", ") });
      }
      setSubmitting(false);
    }
  }

  const shown = new Set(fields.map((f) => f.error ?? f.key));
  const orphanErrors = Object.entries(errors.fields)
    .filter(([key]) => !shown.has(key))
    .map(([key, message]) => `${key}: ${message}`)
    .join("\n");

  return (
    <>
      <PageHeader title={isEdit ? "Editar libro" : "Registrar libro"}>
        <View className="flex-1 flex-row items-center justify-end gap-5">
          <Button
            title="Cancelar"
            variant="pill-secondary"
            onPress={() => router.back()}
          />
          <Button
            title={isEdit ? "Guardar" : "Registrar"}
            variant="pill"
            className="bg-highlight"
            loading={submitting}
            disabled={!canSubmit}
            onPress={submit}
          />
        </View>
      </PageHeader>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-4 pt-7"
        keyboardShouldPersistTaps="handled"
      >
        {errors.form || orphanErrors ? (
          <Text className="text-sm text-red-600">
            {errors.form ?? orphanErrors}
          </Text>
        ) : null}
        {locked && (
          <Text variant="subtitle">
            Título, escritor, categoría y subcategoría están bloqueados porque
            el libro ya tiene tejuelos.
          </Text>
        )}
        <View className={cn("gap-8", isExpanded && "flex-row")}>
          {columns.map((groups, i) => (
            <Fragment key={i}>
              {i > 0 && <Divider vertical={isExpanded} />}
              <View
                className={cn(
                  "gap-8",
                  isExpanded && "flex-1",
                  isExpanded && i === 0 && "w-[80%]",
                )}
              >
                {groups.map((g, j) => (
                  <Fragment key={g.title}>
                    {j > 0 && <Divider />}
                    <View className="gap-4">
                      <Text
                        variant="h1"
                        className="text-highlight font-sans-medium"
                      >
                        {g.title}
                      </Text>
                      <View className="gap-4">
                        {g.fields.filter(isVisible).map((f) => {
                          const label = isRequired(f)
                            ? `${f.label} *`
                            : f.label;
                          const error = errors.fields[f.error ?? f.key];
                          const disabled = locked && f.lockable;

                          return f.inline ? (
                            <InlinePick
                              key={f.key}
                              field={f}
                              label={label}
                              value={v[f.key] as Option | undefined}
                              disabled={disabled}
                              error={error}
                              onChange={(o) =>
                                onFieldChange({
                                  [f.key]: o,
                                } as Partial<BookFormValues>)
                              }
                            />
                          ) : (
                            <FieldRow
                              key={f.key}
                              label={label}
                              value={display(v[f.key]) ?? f.fallback ?? null}
                              error={error}
                              disabled={
                                disabled ||
                                (f.key === "collection" && !v.publisher)
                              }
                              onPress={() => setEditing(f)}
                              labelClass="py-[6]"
                              contentClass={cn(
                                "py-[6]",
                                g.title === "Ejemplares" ? "text-center" : "",
                              )}
                              containerClass={
                                g.title === "Ejemplares" ? "w-[50%]" : ""
                              }
                            />
                          );
                        })}
                      </View>
                    </View>
                  </Fragment>
                ))}
              </View>
            </Fragment>
          ))}
        </View>
      </ScrollView>

      {editing && (
        <FieldModal
          field={editing}
          values={v}
          onChange={onFieldChange}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

const Divider = ({ vertical }: { vertical?: boolean }) => (
  <View className={vertical ? "w-px self-stretch bg-fg1" : "h-px bg-fg1"} />
);
