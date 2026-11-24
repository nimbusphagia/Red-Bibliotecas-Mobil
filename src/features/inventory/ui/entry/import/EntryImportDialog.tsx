import { useSession } from "@/features/account/internal/session";
import {
  loadCategories,
  loadShelves,
  loadSubcategories,
  useOptions,
} from "@/features/catalog/ui/options";
import type { BookFormValues } from "@/features/catalog/ui/form/fields/values";
import {
  createImportEntities,
  resolveEntryImport,
} from "@/features/inventory/internal/entryImport/service";
import type { ImportPlan } from "@/features/inventory/internal/entryImport/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  Surface,
  Text,
} from "@/features/shared/components";
import { toFormErrors } from "@/features/shared/errors/messages";
import { sheetProblemText } from "@/features/shared/format/translate";
import { File } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import ImportReview from "./ImportReview";
import {
  pickSheet,
  saveTemplate,
  SheetReadError,
  shareTemplate,
} from "./sheetFile";
import { isReady, toFormValues } from "./toLines";

const SHOW_SHARE = false;

const HINTS = [
  "Si un libro ya está en el catálogo, agrégalo con «Existente».",
  "Los autores, editoriales, colecciones y series que no existan se crearán al confirmar.",
  "Completa la plantilla con los libros que quieras ingresar.",
];

type Props = {
  /** Cuántos libros más caben en la entrada. */
  room: number;
  onLoad: (books: BookFormValues[]) => void;
  onClose: () => void;
};

export default function EntryImportDialog({ room, onLoad, onClose }: Props) {
  const session = useSession();
  const categories = useOptions(loadCategories);
  const subcategories = useOptions(loadSubcategories);
  const shelves = useOptions(loadShelves);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [review, setReview] = useState<{ name: string; plan: ImportPlan }>();

  const guard = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    setNotice(undefined);
    try {
      await action();
    } catch (e) {
      setError(toFormErrors(e).form);
    } finally {
      setBusy(false);
    }
  };

  const choose = () =>
    guard(async () => {
      if (session.status !== "signed-in") return;
      let file: Awaited<ReturnType<typeof pickSheet>>;
      try {
        file = await pickSheet();
      } catch (e) {
        console.error(e);
        setError(
          e instanceof SheetReadError
            ? e.message
            : "No se pudo abrir el selector de archivos.",
        );
        return;
      }
      if (!file) return;
      const plan = await resolveEntryImport(session.account.id, file.grid);
      setReview({ name: file.name, plan });
    });

  const share = () => guard(shareTemplate);

  const save = () =>
    guard(async () => {
      if (await saveTemplate())
        setNotice("Plantilla guardada en la carpeta elegida");
    });

  const ready = review?.plan.rows.filter(isReady) ?? [];
  const tooMany = ready.length > room;

  const load = () =>
    guard(async () => {
      if (session.status !== "signed-in" || !review || tooMany) return;
      const created = await createImportEntities(
        session.account.id,
        review.plan.toCreate,
      );
      const catalog = { categories, subcategories, shelves };
      onLoad(ready.map((r) => toFormValues(r, created, catalog)));
    });

  const problem = review?.plan.problem;

  return (
    <Dialog onClose={onClose} size="lg" className="gap-6">
      <DialogHeader
        title="Importar"
        subtitle="Ingresa libros nuevos desde un archivo .xlsx o .csv"
        actions={
          review ? (
            <Button
              title={review.name}
              className="max-w-[240px]"
              variant="soft"
              size="sm"
              loading={busy}
              onPress={choose}
            />
          ) : (
            <>
              {SHOW_SHARE && (
                <Button
                  title="Compartir"
                  variant="soft"
                  size="sm"
                  loading={busy}
                  onPress={share}
                />
              )}
              <Button
                title="Plantilla"
                icon={File}
                variant="soft"
                size="sm"
                loading={busy}
                onPress={save}
              />
            </>
          )
        }
      />
      <DialogBody className="flex-1">
        {!review && (
          <>
            <Surface inset className="gap-1 p-3">
              {HINTS.map((hint) => (
                <View key={hint} className="flex-row gap-2">
                  <Text variant="itemSm">•</Text>
                  <Text variant="itemSm" className="flex-1">
                    {hint}
                  </Text>
                </View>
              ))}
            </Surface>
            {notice && <Text variant="caption">{notice}</Text>}
          </>
        )}
        {review && problem && (
          <Text variant="item">{sheetProblemText(problem)}</Text>
        )}
        {review && !problem && <ImportReview plan={review.plan} />}
        <FieldError>
          {error ??
            (tooMany
              ? `Caben ${room} libros más en la entrada; el archivo trae ${ready.length}`
              : undefined)}
        </FieldError>
      </DialogBody>
      {review ? (
        <DialogActions
          className="justify-between"
          cancelVariant="ghost"
          confirmTitle="Importar"
          loading={busy}
          disabled={ready.length === 0 || tooMany}
          onConfirm={load}
          onCancel={onClose}
        />
      ) : (
        <DialogActions
          className="justify-between"
          cancelVariant="ghost"
          confirmTitle="Elegir archivo"
          loading={busy}
          onConfirm={choose}
          onCancel={onClose}
        />
      )}
    </Dialog>
  );
}
