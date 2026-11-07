import { db } from "@/db/client";
import { inTransaction } from "@/db/transaction";
import { parseOrThrow } from "@/shared/validation/validation";
import { mapWriteErrors } from "@/shared/validation/validation";
import { previewLines } from "./utils/plan";
import { prepareLines } from "./utils/prepare";
import {
  entryMovementSchema,
  exitMovementSchema,
  registerCopiesSchema,
  type EntryMovementInput,
  type EntryMovementParsed,
  type ExitMovementInput,
  type RegisterCopiesInput,
} from "./schemas";
import type { EntryResult, ExitResult, LabelPreview } from "./types";
import { requireStockRole } from "./utils/auth";
import { writeEntry } from "./utils/write";
import { writeExit } from "./utils/exit";
import { NotFoundError } from "@/errors/errors";
import { idSchema } from "@/shared/types/schemas";
import type { Page } from "@/shared/types/types";
import * as repo from "./repository";
import {
  listLinesSchema,
  listMovementsSchema,
  type MovementLinesParams,
  type MovementListParams,
} from "./schemas";
import type { MovementLine, MovementListItem } from "./types";

async function run(
  actorId: number,
  input: EntryMovementParsed,
): Promise<EntryResult> {
  const lines = await prepareLines(input.lines, input.shelfId);
  const header = {
    reason: input.reason,
    signedById: actorId,
    notes: input.notes,
  };
  return mapWriteErrors("stock movement", async () =>
    inTransaction((tx) => writeEntry(tx, header, lines)),
  );
}

export async function registerCopies(
  actorId: number,
  input: RegisterCopiesInput,
): Promise<EntryResult> {
  await requireStockRole(actorId, "register stock");
  return run(actorId, parseOrThrow(registerCopiesSchema, input));
}

export async function createEntryMovement(
  actorId: number,
  input: EntryMovementInput,
): Promise<EntryResult> {
  await requireStockRole(actorId, "register stock");
  return run(actorId, parseOrThrow(entryMovementSchema, input));
}

export async function previewEntryLabels(
  actorId: number,
  input: RegisterCopiesInput,
): Promise<LabelPreview[]> {
  await requireStockRole(actorId, "register stock");
  const parsed = parseOrThrow(registerCopiesSchema, input);
  const lines = await prepareLines(parsed.lines, parsed.shelfId);
  return previewLines(db, lines);
}

export async function exitCopies(
  actorId: number,
  input: ExitMovementInput,
): Promise<ExitResult> {
  await requireStockRole(actorId, "remove stock");
  const parsed = parseOrThrow(exitMovementSchema, input);
  const header = {
    reason: parsed.reason,
    signedById: actorId,
    notes: parsed.notes,
  };
  return mapWriteErrors("stock movement", async () =>
    inTransaction((tx) => writeExit(tx, header, parsed.copyIds)),
  );
}

export async function listMovements(
  params: MovementListParams = {},
): Promise<Page<MovementListItem>> {
  return repo.listMovements(parseOrThrow(listMovementsSchema, params));
}

export async function getMovement(id: number): Promise<MovementListItem> {
  const validId = parseOrThrow(idSchema, id);
  const found = await repo.findMovementById(validId);
  if (!found) throw new NotFoundError("stock movement", validId);
  return found;
}

export async function listMovementLines(
  params: MovementLinesParams,
): Promise<Page<MovementLine>> {
  const { movementId, ...page } = parseOrThrow(listLinesSchema, params);
  await getMovement(movementId);
  return repo.listMovementLines(movementId, page);
}
