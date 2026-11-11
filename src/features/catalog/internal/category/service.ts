import { parseOrThrow } from "@/shared/validation/validation";
import {
  listReferenceSchema,
  type ReferenceListParams,
  type ReferenceUsage,
} from "../_shared/reference";
import { makeReads } from "../_shared/service";
import * as repo from "./repository";
import type { Category, CategoryWithBookCount } from "./types";

export const { get: getCategory, getUsage: getCategoryUsage } = makeReads<
  Category,
  ReferenceUsage
>("category", {
  findById: repo.findCategoryById,
  countUsage: repo.countCategoryUsage,
});

export async function listCategories(
  params: ReferenceListParams = {},
): Promise<CategoryWithBookCount[]> {
  return repo.listCategories(parseOrThrow(listReferenceSchema, params));
}
