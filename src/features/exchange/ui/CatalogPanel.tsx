import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  Panel,
  Text,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { Download, Upload } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import {
  exportCatalog,
  importCatalog,
  parseCatalog,
} from "../internal/service";
import type { CatalogFile, CatalogSummary } from "../internal/types";
import { pickCatalogFile, saveCatalogFile } from "./catalogFile";

type Pending = { file: CatalogFile; summary: CatalogSummary };

export default function CatalogPanel({ actorId }: { actorId: number }) {
  const { errors, submitting, run, release } = useFormSubmit();
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const guard = (action: () => Promise<void>) =>
    run(async () => {
      setNotice(null);
      await action();
      release();
    });

  const exportFile = () =>
    guard(async () => {
      if (await saveCatalogFile(await exportCatalog(actorId)))
        setNotice("Catálogo guardado en la carpeta elegida");
    });

  const pickFile = () =>
    guard(async () => {
      const text = await pickCatalogFile();
      if (text !== null) setPending(parseCatalog(text));
    });

  return (
    <Panel
      title="Catálogo"
      subtitle="Copia libros, estanterías y ejemplares a una tablet nueva"
    >
      <View className="flex-row gap-2">
        <Button
          title="Exportar"
          icon={Download}
          size="sm"
          variant="soft"
          disabled={submitting}
          onPress={() => void exportFile()}
        />
        <Button
          title="Importar"
          icon={Upload}
          size="sm"
          variant="soft"
          disabled={submitting}
          onPress={() => void pickFile()}
        />
      </View>
      <FieldError>{errors.form}</FieldError>
      {notice && <Text variant="caption">{notice}</Text>}
      {pending && (
        <ImportDialog
          actorId={actorId}
          pending={pending}
          onClose={() => setPending(null)}
          onDone={() => {
            setPending(null);
            setNotice("Catálogo importado");
          }}
        />
      )}
    </Panel>
  );
}

type DialogProps = {
  actorId: number;
  pending: Pending;
  onClose: () => void;
  onDone: () => void;
};

function ImportDialog({ actorId, pending, onClose, onDone }: DialogProps) {
  const { errors, submitting, run } = useFormSubmit();
  const { summary } = pending;

  const confirm = () =>
    run(async () => {
      await importCatalog(actorId, pending.file);
      onDone();
    });

  return (
    <Dialog onClose={onClose} size="sm">
      <DialogHeader title="Importar catálogo" />
      <DialogBody>
        <Text>
          Exportado el {formatDateES(summary.exportedAt, true)}: {summary.books}{" "}
          libros, {summary.copies} ejemplares y {summary.shelves} estanterías.
        </Text>
        <Text>
          Se reemplazarán el catálogo, las estanterías, los ejemplares y el
          historial de stock de esta tablet. No se puede deshacer.
        </Text>
      </DialogBody>
      <FieldError>{errors.form}</FieldError>
      <DialogActions
        confirmTitle="Reemplazar"
        loading={submitting}
        onConfirm={() => void confirm()}
        onCancel={onClose}
      />
    </Dialog>
  );
}
