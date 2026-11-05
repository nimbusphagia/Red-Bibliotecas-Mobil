import { z } from "zod";
import { clamp, searchKey } from "../format/text";

export const LIST_LIMIT_DEFAULT = 50;
export const LIST_LIMIT_MAX = 100;

export const idSchema = z.number().int().positive();
export const routeIdSchema = z.coerce.number().int().positive();

export const listShape = <const K extends readonly [string, ...string[]]>(
  sortKeys: K,
  defaultSort: K[number],
) => ({
  search: z.string().default(""),
  sortBy: z.enum(sortKeys).default(defaultSort),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
  limit: z
    .number()
    .int()
    .default(LIST_LIMIT_DEFAULT)
    .transform(clamp(1, LIST_LIMIT_MAX)),
  offset: z
    .number()
    .int()
    .default(0)
    .transform(clamp(0, Number.MAX_SAFE_INTEGER)),
});

export const withTokens = <T extends { search: string }>({
  search,
  ...rest
}: T) => ({
  ...rest,
  tokens: searchKey(search).split(" ").filter(Boolean),
});
