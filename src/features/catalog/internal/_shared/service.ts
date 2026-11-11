import {
  isForeignKeyViolation,
  isUniqueViolation,
  uniqueViolationColumns,
} from "@/errors/db-errors";
import {
  DuplicateError,
  InUseError,
  InvalidReferenceError,
  NotFoundError,
  ProtectedError,
} from "@/errors/errors";
import { idSchema } from "@/shared/types/schemas";
import { mapWriteErrors, parseOrThrow } from "@/shared/validation/validation";
import type { z } from "zod";

export const parseId = (id: unknown) => parseOrThrow(idSchema, id);

export function makeReads<Row, Usage>(
  entity: string,
  repo: {
    findById: (id: number) => Promise<Row | null>;
    countUsage: (id: number) => Promise<Usage | null>;
  },
) {
  async function get(id: number): Promise<Row> {
    const validId = parseId(id);
    const found = await repo.findById(validId);
    if (!found) throw new NotFoundError(entity, validId);
    return found;
  }

  async function getUsage(id: number): Promise<Usage> {
    const validId = parseId(id);
    const usage = await repo.countUsage(validId);
    if (!usage) throw new NotFoundError(entity, validId);
    return usage;
  }

  return { get, getUsage };
}
export function makeCreate<S extends z.ZodType, New, Row>(o: {
  entity: string;
  schema: S;
  build: (parsed: z.output<S>) => New | Promise<New>;
  insert: (values: New) => Promise<Row>;
}) {
  return async (input: z.input<S>): Promise<Row> => {
    const values = await o.build(parseOrThrow(o.schema, input));
    return mapWriteErrors(o.entity, () => o.insert(values));
  };
}

export function makeUpdate<
  S extends z.ZodType,
  Row extends { id: number },
  Patch,
>(o: {
  entity: string;
  schema: S;
  find: (id: number) => Promise<Row | null>;
  update: (id: number, patch: Patch) => Promise<Row | null>;
  build: (existing: Row, parsed: z.output<S>) => Patch | Promise<Patch>;
  isProtected?: (row: Row) => boolean;
}) {
  return async (id: number, input: z.input<S>): Promise<Row> => {
    const validId = parseId(id);
    const parsed = parseOrThrow(o.schema, input);

    const existing = await o.find(validId);
    if (!existing) throw new NotFoundError(o.entity, validId);
    if (o.isProtected?.(existing)) throw new ProtectedError(o.entity, validId);

    if (Object.values(parsed as object).every((v) => v === undefined)) {
      return existing;
    }

    const patch = await o.build(existing, parsed);
    if (Object.keys(patch as object).length === 0) return existing;

    const updated = await mapWriteErrors(o.entity, () =>
      o.update(validId, patch),
    );
    if (!updated) throw new NotFoundError(o.entity, validId);
    return updated;
  };
}

export function makeRemove<Row extends { id: number }>(o: {
  entity: string;
  find: (id: number) => Promise<Row | null>;
  countUsage: (id: number) => Promise<Record<string, number> | null>;
  deleteIfUnused: (id: number) => Promise<boolean>;
  isProtected?: (row: Row) => boolean;
}) {
  return async (id: number): Promise<void> => {
    const validId = parseId(id);

    const existing = await o.find(validId);
    if (!existing) throw new NotFoundError(o.entity, validId);
    if (o.isProtected?.(existing)) throw new ProtectedError(o.entity, validId);

    if (await o.deleteIfUnused(validId)) return;

    const usage = await o.countUsage(validId);
    if (!usage) throw new NotFoundError(o.entity, validId);
    throw new InUseError(
      o.entity,
      validId,
      Object.fromEntries(Object.entries(usage).filter(([, n]) => n > 0)),
    );
  };
}
