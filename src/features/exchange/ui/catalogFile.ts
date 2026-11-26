import { toISODate } from "@/features/shared/format/dates";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File } from "expo-file-system";
import type { CatalogFile } from "../internal/types";

const TYPE = "application/json";

/** Guarda el archivo en la carpeta que se elija; false si se cancela. */
export async function saveCatalogFile(file: CatalogFile): Promise<boolean> {
  let folder: Directory;
  try {
    folder = await Directory.pickDirectoryAsync();
  } catch {
    return false;
  }
  const out = folder.createFile(`catalogo-${toISODate()}.json`, TYPE);
  await out.write(JSON.stringify(file));
  return true;
}

/** Deja elegir un archivo y devuelve su texto; null si se cancela. */
export async function pickCatalogFile(): Promise<string | null> {
  // Android no siempre reconoce .json, así que se acepta cualquiera y se valida al leer.
  const picked = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    copyToCacheDirectory: true,
  });
  if (picked.canceled) return null;
  return new File(picked.assets[0].uri).text();
}
