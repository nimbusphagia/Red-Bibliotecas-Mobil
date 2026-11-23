import { db } from "@/db/client";
import { findBookByLabelPrefixSync } from "../book/repository";

export {
  findAuthorsByKey,
  findBooksByTitleKey,
  findCollectionsByKey,
  findPublishersByKey,
  findSeriesByKey,
} from "./repository";

/** Libro que ya usa ese tejuelo (sin el número de ejemplar), si lo hay. */
export function findLabelOwner(prefix: string, titleCode: string) {
  return findBookByLabelPrefixSync(db, prefix, titleCode, 0);
}
