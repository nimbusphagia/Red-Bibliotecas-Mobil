import { useSession } from "@/features/account/internal/session";
import { createCollection } from "@/features/catalog/internal/collection/service";
import { createPublisher } from "@/features/catalog/internal/publisher/service";
import { createSeries } from "@/features/catalog/internal/series/service";
import { registerCopies } from "@/features/inventory/internal/movement/service";
import { Button, Text } from "@/features/shared/components";
import { TextField } from "@/features/shared/components/form";
import Header from "@/features/shared/components/header/Header";
import {
  MultiSearchSelect,
  SearchSelect,
  SimpleSelect,
  type Option,
} from "@/features/shared/components/select/Select";
import {
  toFormErrors,
  type FormErrors,
} from "@/features/shared/errors/messages";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { useRouter } from "expo-router";
import { useCallback, useState, type PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import CopiesFields from "./formComponents/CopiesFields";
import NewAuthorDialog from "./formComponents/NewAuthorDialog";
import {
  EMPTY_VALUES,
  ROLES,
  toBookInput,
  type BookFormValues,
  type RoleKey,
} from "./formComponents/values";
import {
  loadCategories,
  loadSubcategories,
  searchAuthors,
  searchCollections,
  searchPublishers,
  searchSeries,
  useOptions,
} from "./options";

const digits = (t: string) => t.replace(/\D/g, "");
const SHOWN_FIELDS = new Set([
  "title",
  "collaborators",
  "publicationYear",
  "pageCount",
  "categoryId",
  "subcategoryId",
  "publisherId",
  "collectionId",
  "seriesId",
  "quantity",
  "omitWords",
]);

export default function BookForm() {
  const router = useRouter();
  const session = useSession();
  const { isExpanded } = useLayoutMode();

  const [v, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);
  const [newAuthor, setNewAuthor] = useState<{
    key: RoleKey;
    name: string;
  } | null>(null);

  const categories = useOptions(loadCategories);
  const subcategories = useOptions(loadSubcategories);

  const publisherId = v.publisher?.id;
  const fetchCollections = useCallback(
    (search: string) => searchCollections(search, publisherId),
    [publisherId],
  );

  const set = (patch: Partial<BookFormValues>) =>
    setValues((p) => ({ ...p, ...patch }));
  const setRole = (key: RoleKey, list: Option[]) =>
    setValues((p) => ({ ...p, [key]: list }));

  const attempt = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (error) {
      setErrors(toFormErrors(error));
    }
  };

  const canSubmit =
    v.title.trim() !== "" &&
    v.writers.length > 0 &&
    v.categoryId !== undefined &&
    v.subcategoryId !== undefined;

  async function submit() {
    if (submitting || session.status !== "signed-in") return;
    setErrors({ fields: {} });
    setSubmitting(true);
    try {
      const { lines } = await registerCopies(session.account.id, {
        shelfId: v.shelfId,
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

  const column = cn("gap-8", isExpanded && "flex-1");

  const orphanErrors = Object.entries(errors.fields)
    .filter(([key]) => !SHOWN_FIELDS.has(key))
    .map(([key, message]) => `${key}: ${message}`)
    .join("\n");

  return (
    <>
      <Header title="Registrar libro">
        <View className="flex-1 flex-row items-center justify-between pl-5">
          <Button
            title="Cancelar"
            variant="pill-secondary"
            onPress={() => router.back()}
          />
          <Button
            title="Guardar"
            variant="pill"
            className="bg-highlight"
            loading={submitting}
            disabled={!canSubmit}
            onPress={submit}
          />
        </View>
      </Header>

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

        <View className={cn("gap-8", isExpanded && "flex-row")}>
          <View className={column}>
            <Section title="Detalles">
              <TextField
                label="Título *"
                value={v.title}
                onChangeText={(title) => set({ title })}
                error={errors.fields.title}
                autoCapitalize="words"
              />
              {ROLES.map(({ key, label }) => (
                <MultiSearchSelect
                  key={key}
                  label={key === "writers" ? `${label} *` : label}
                  values={v[key]}
                  onChange={(list) => setRole(key, list)}
                  fetchOptions={searchAuthors}
                  placeholder="Agregar..."
                  onCreate={(name) => setNewAuthor({ key, name })}
                />
              ))}
              <FieldError message={errors.fields.collaborators} />
              <View className="flex-row gap-4">
                <TextField
                  label="Año"
                  containerClassName="flex-1"
                  value={v.year}
                  onChangeText={(t) => set({ year: digits(t) })}
                  keyboardType="number-pad"
                  error={errors.fields.publicationYear}
                />
                <TextField
                  label="Páginas"
                  containerClassName="flex-1"
                  value={v.pages}
                  onChangeText={(t) => set({ pages: digits(t) })}
                  keyboardType="number-pad"
                  error={errors.fields.pageCount}
                />
              </View>
            </Section>

            <Section title="Clasificación">
              <SimpleSelect
                label="Categoría *"
                options={categories}
                value={v.categoryId}
                onChange={(categoryId) => set({ categoryId })}
              />
              <FieldError message={errors.fields.categoryId} />
              <SimpleSelect
                label="Subcategoría *"
                options={subcategories}
                value={v.subcategoryId}
                onChange={(subcategoryId) => set({ subcategoryId })}
              />
              <FieldError message={errors.fields.subcategoryId} />
            </Section>
          </View>

          <View className={column}>
            <Section title="Publicación">
              <SearchSelect
                label="Editorial"
                value={v.publisher}
                onChange={(publisher) =>
                  set({ publisher, collection: undefined })
                }
                fetchOptions={searchPublishers}
                placeholder="Ninguna"
                clearLabel="Quitar"
                onCreate={(name) =>
                  attempt(async () => {
                    const p = await createPublisher({ name });
                    set({
                      publisher: { id: p.id, label: p.name },
                      collection: undefined,
                    });
                  })
                }
              />
              <FieldError message={errors.fields.publisherId} />
              <SearchSelect
                label="Colección"
                value={v.collection}
                onChange={(collection) => set({ collection })}
                fetchOptions={fetchCollections}
                placeholder={
                  publisherId ? "Ninguna" : "Elige primero una editorial"
                }
                clearLabel="Quitar"
                disabled={!publisherId}
                onCreate={
                  publisherId
                    ? (name) =>
                        attempt(async () => {
                          const c = await createCollection({
                            name,
                            publisherId,
                          });
                          set({ collection: { id: c.id, label: c.name } });
                        })
                    : undefined
                }
              />
              <FieldError message={errors.fields.collectionId} />
              <SearchSelect
                label="Serie"
                value={v.series}
                onChange={(series) => set({ series })}
                fetchOptions={searchSeries}
                placeholder="Ninguna"
                clearLabel="Quitar"
                onCreate={(name) =>
                  attempt(async () => {
                    const author = v.writers[0];
                    if (!author) {
                      setErrors({
                        fields: { seriesId: "Elige primero un escritor" },
                      });
                      return;
                    }
                    const s = await createSeries({ name, authorId: author.id });
                    set({
                      series: {
                        id: s.id,
                        label: `${s.name} · ${author.label}`,
                      },
                    });
                  })
                }
              />
              <FieldError message={errors.fields.seriesId} />
            </Section>

            <Section title="Ejemplares">
              <CopiesFields values={v} errors={errors} onChange={set} />
            </Section>
          </View>
        </View>
      </ScrollView>

      {newAuthor && (
        <NewAuthorDialog
          initialName={newAuthor.name}
          onClose={() => setNewAuthor(null)}
          onCreated={(author) => {
            setRole(newAuthor.key, [...v[newAuthor.key], author]);
            setNewAuthor(null);
          }}
        />
      )}
    </>
  );
}

function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View className="gap-4">
      <Text variant="h2" className="text-highlight">
        {title}
      </Text>
      {children}
    </View>
  );
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <Text className="text-sm text-red-600">{message}</Text> : null;
