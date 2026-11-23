import { inTransaction } from "@/db/transaction";
import { NotFoundError } from "@/features/shared/errors/errors";
import { idSchema } from "@/features/shared/types/schemas";
import type { Page } from "@/features/shared/types/types";
import {
  mapWriteErrors,
  parseOrThrow,
} from "@/features/shared/validation/validation";
import * as repo from "./repository";
import {
  exitMovementSchema,
  listLinesSchema,
  listMovementsSchema,
  registerCopiesSchema,
  type ExitMovementInput,
  type MovementLinesParams,
  type MovementListParams,
  type RegisterCopiesInput,
} from "./schemas";
import type {
  EntryResult,
  ExitResult,
  MovementLine,
  MovementListItem,
} from "./types";
import { requireStockRole } from "./utils/auth";
import { writeExit } from "./utils/exit";
import { prepareLines } from "./utils/prepare";
import { writeEntry } from "./utils/write";

export async function registerCopies(
  actorId: number,
  input: RegisterCopiesInput,
): Promise<EntryResult> {
  await requireStockRole(actorId, "register stock");
  const parsed = parseOrThrow(registerCopiesSchema, input);
  const lines = await prepareLines(parsed.lines, parsed.shelfId);
  const header = {
    reason: parsed.reason,
    signedById: actorId,
    notes: parsed.notes,
  };
  return mapWriteErrors("stock movement", async () =>
    inTransaction((tx) => writeEntry(tx, header, lines)),
  );
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
