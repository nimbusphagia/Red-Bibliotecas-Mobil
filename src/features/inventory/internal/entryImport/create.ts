import { createAuthor } from "@/features/catalog/internal/author/service";
import { createCollection } from "@/features/catalog/internal/collection/service";
import {
  findAuthorsByKey,
  findCollectionsByKey,
  findPublishersByKey,
  findSeriesByKey,
} from "@/features/catalog/internal/lookup/service";
import { createPublisher } from "@/features/catalog/internal/publisher/service";
import { createSeries } from "@/features/catalog/internal/series/service";
import { searchKey } from "@/features/shared/format/text";
import { requireStockRole } from "../movement/utils/auth";
import type { ToCreate } from "./types";

/** Id de lo que se creó (o ya existía), por la clave que traía el plan. */
export type CreatedRefs = {
  authors: Record<string, number>;
  publishers: Record<string, number>;
  collections: Record<string, number>;
  series: Record<string, number>;
};

/**
 * Crea los autores, editoriales, colecciones y series que faltan. Se puede
 * repetir: lo que ya existe (por ejemplo, de un intento anterior que se cortó)
 * se reutiliza en lugar de duplicarse.
 */
export async function createImportEntities(
  actorId: number,
  toCreate: ToCreate,
): Promise<CreatedRefs> {
  await requireStockRole(actorId, "import stock");

  // Las series y colecciones nuevas pueden colgar de un autor o editorial que
  // ya existe y no viene en la lista, así que también se buscan sus claves.
  const authorIds = new Map(
    (
      await findAuthorsByKey([
        ...new Set([
          ...toCreate.authors.map((a) => a.key),
          ...toCreate.series.map((s) => s.authorKey),
        ]),
      ])
    ).map((a) => [a.nameKey, a.id] as const),
  );
  const authors: CreatedRefs["authors"] = {};
  for (const a of toCreate.authors) {
    const id =
      authorIds.get(a.key) ??
      (await createAuthor({ firstName: a.firstName, lastName: a.lastName })).id;
    authorIds.set(a.key, id);
    authors[a.key] = id;
  }

  const publisherIds = new Map(
    (
      await findPublishersByKey([
        ...new Set([
          ...toCreate.publishers.map((p) => p.key),
          ...toCreate.collections.map((c) => c.publisherKey),
        ]),
      ])
    ).map((p) => [p.nameKey, p.id] as const),
  );
  const publishers: CreatedRefs["publishers"] = {};
  for (const p of toCreate.publishers) {
    const id =
      publisherIds.get(p.key) ?? (await createPublisher({ name: p.name })).id;
    publisherIds.set(p.key, id);
    publishers[p.key] = id;
  }

  const collections: CreatedRefs["collections"] = {};
  const existingCollections = new Map(
    (
      await findCollectionsByKey(
        [...publisherIds.values()],
        toCreate.collections.map((c) => searchKey(c.name)),
      )
    ).map((c) => [`${c.publisherId}|${c.nameKey}`, c.id] as const),
  );
  for (const c of toCreate.collections) {
    const publisherId = publisherIds.get(c.publisherKey)!;
    const found = existingCollections.get(
      `${publisherId}|${searchKey(c.name)}`,
    );
    collections[c.key] =
      found ?? (await createCollection({ name: c.name, publisherId })).id;
  }

  const series: CreatedRefs["series"] = {};
  const existingSeries = new Map(
    (
      await findSeriesByKey(
        [...authorIds.values()],
        toCreate.series.map((s) => searchKey(s.name)),
      )
    ).map((s) => [`${s.authorId}|${s.nameKey}`, s.id] as const),
  );
  for (const s of toCreate.series) {
    const authorId = authorIds.get(s.authorKey)!;
    const found = existingSeries.get(`${authorId}|${searchKey(s.name)}`);
    series[s.key] =
      found ?? (await createSeries({ name: s.name, authorId })).id;
  }

  return { authors, publishers, collections, series };
}
