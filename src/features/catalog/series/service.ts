import { InUseError } from "@/shared/errors";
import { searchKey } from "@/shared/text";
import { parseOrThrow } from "@/shared/validation";
import { getAuthor } from "../author/service";
import type { ReferenceUsage } from "../_shared/reference";
import {
  makeCreate,
  makeReads,
  makeRemove,
  makeUpdate,
} from "../_shared/service";
import * as repo from "./repository";
import {
  createSeriesSchema,
  listSeriesSchema,
  updateSeriesSchema,
  type SeriesListParams,
} from "./schemas";
import type { NewSeries, Series, SeriesListItem, SeriesPatch } from "./types";

const ENTITY = "series";

export const { get: getSeries, getUsage: getSeriesUsage } = makeReads<
  Series,
  ReferenceUsage
>(ENTITY, {
  findById: repo.findSeriesById,
  countUsage: repo.countSeriesUsage,
});

export async function listSeries(
  params: SeriesListParams = {},
): Promise<SeriesListItem[]> {
  return repo.listSeries(parseOrThrow(listSeriesSchema, params));
}

export const createSeries = makeCreate({
  entity: ENTITY,
  schema: createSeriesSchema,
  build: async ({ name, authorId }): Promise<NewSeries> => {
    await getAuthor(authorId);
    return { name, nameKey: searchKey(name), authorId };
  },
  insert: repo.insertSeries,
});

export const updateSeries = makeUpdate({
  entity: ENTITY,
  schema: updateSeriesSchema,
  find: repo.findSeriesById,
  update: repo.updateSeries,
  build: async (existing, { name, authorId }): Promise<SeriesPatch> => {
    const patch: SeriesPatch = {};

    if (name !== undefined) {
      patch.name = name;
      patch.nameKey = searchKey(name);
    }

    if (authorId !== undefined && authorId !== existing.authorId) {
      await getAuthor(authorId);

      const usage = await repo.countSeriesUsage(existing.id);
      if (usage && usage.books > 0) {
        throw new InUseError(ENTITY, existing.id, { books: usage.books });
      }
      patch.authorId = authorId;
    }

    return patch;
  },
});

export const deleteSeries = makeRemove({
  entity: ENTITY,
  find: repo.findSeriesById,
  countUsage: repo.countSeriesUsage,
  deleteIfUnused: repo.deleteSeriesIfUnused,
});
