import { parseOrThrow } from "@/shared/validation";
import { makeReads } from "../_shared/service";
import {
  listReferenceSchema,
  type ReferenceListParams,
  type ReferenceUsage,
} from "../_shared/reference";
import * as repo from "./repository";
import type { Subcategory, SubcategoryWithBookCount } from "./types";

export const { get: getSubcategory, getUsage: getSubcategoryUsage } = makeReads<
  Subcategory,
  ReferenceUsage
>("subcategory", {
  findById: repo.findSubcategoryById,
  countUsage: repo.countSubcategoryUsage,
});

export async function listSubcategories(
  params: ReferenceListParams = {},
): Promise<SubcategoryWithBookCount[]> {
  return repo.listSubcategories(parseOrThrow(listReferenceSchema, params));
}
