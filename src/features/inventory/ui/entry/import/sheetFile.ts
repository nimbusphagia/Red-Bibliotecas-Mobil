import { entryTemplate } from "@/features/inventory/internal/entryImport/service";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { gridFromBytes, templateBytes } from "./sheetGrid";

const TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/comma-separated-values",
  "application/vnd.ms-excel",
];

/** Un fallo al leer el archivo elegido, con la etapa en que ocurrió. */
export class SheetReadError extends Error {
  constructor(stage: "read" | "parse", cause: unknown) {
    super(
      stage === "read"
        ? "No se pudo leer el archivo"
        : "El archivo no parece un .xlsx o .csv válido",
    );
    this.name = "SheetReadError";
    this.cause = cause;
  }
}

/** Primero con la API de archivos; si no la deja, con fetch (file:// o content://). */
async function bytesOf(uri: string): Promise<Uint8Array> {
  try {
    return await new File(uri).bytes();
  } catch (first) {
    try {
      return new Uint8Array(await (await fetch(uri)).arrayBuffer());
    } catch {
      throw first;
    }
  }
}

/** Deja elegir un archivo (.xlsx o .csv) y lo lee; null si se cancela. */
export async function pickSheet(): Promise<{
  name: string;
  grid: string[][];
} | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: TYPES,
    copyToCacheDirectory: true,
  });
  if (picked.canceled) return null;
  const asset = picked.assets[0];

  let bytes: Uint8Array;
  try {
    bytes = await bytesOf(asset.uri);
  } catch (e) {
    throw new SheetReadError("read", e);
  }
  try {
    return { name: asset.name, grid: gridFromBytes(bytes) };
  } catch (e) {
    throw new SheetReadError("parse", e);
  }
}

const TEMPLATE_NAME = "plantilla_entrada.xlsx";

/**
 * Guarda la plantilla en la carpeta que se elija (selector de Android), sin
 * depender de que el dispositivo tenga una app de archivos en el menú de
 * compartir. Devuelve false si se cancela la elección de carpeta.
 */
export async function saveTemplate(): Promise<boolean> {
  let folder: Directory;
  try {
    folder = await Directory.pickDirectoryAsync();
  } catch {
    return false;
  }
  const file = folder.createFile(TEMPLATE_NAME, TYPES[0]);
  await file.write(templateBytes(await entryTemplate()));
  return true;
}

/** Genera la plantilla y abre el menú de compartir de Android. */
export async function shareTemplate(): Promise<void> {
  const file = new File(Paths.cache, TEMPLATE_NAME);
  file.create({ overwrite: true });
  await file.write(templateBytes(await entryTemplate()));
  await Sharing.shareAsync(file.uri, {
    mimeType: TYPES[0],
    dialogTitle: "Plantilla de entrada",
  });
}
