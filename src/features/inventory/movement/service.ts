import { db } from "@/db/client";
import type { ACCOUNT_ROLES } from "@/db/schema";
import { inTransaction } from "@/db/transaction";
import { ForbiddenError } from "@/errors/errors";
import { requireActive } from "@/features/account/service";
import { parseOrThrow } from "@/shared/validation/validation";
import { mapWriteErrors } from "@/shared/validation/validation";
import { previewLines } from "./utils/plan";
import { prepareLines } from "./utils/prepare";
import {
  entryMovementSchema,
  registerCopiesSchema,
  type EntryMovementInput,
  type EntryMovementParsed,
  type RegisterCopiesInput,
} from "./schemas";
import type { EntryResult, LabelPreview } from "./types";
import { writeEntry } from "./utils/write";

const STOCK_ROLES: readonly (typeof ACCOUNT_ROLES)[number][] = [
  "owner",
  "admin",
];

async function requireStockRole(actorId: number) {
  const actor = await requireActive(actorId);
  if (!STOCK_ROLES.includes(actor.role)) {
    throw new ForbiddenError("register stock");
  }
  return actor;
}

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
  await requireStockRole(actorId);
  return run(actorId, parseOrThrow(registerCopiesSchema, input));
}

export async function createEntryMovement(
  actorId: number,
  input: EntryMovementInput,
): Promise<EntryResult> {
  await requireStockRole(actorId);
  return run(actorId, parseOrThrow(entryMovementSchema, input));
}

export async function previewEntryLabels(
  actorId: number,
  input: RegisterCopiesInput,
): Promise<LabelPreview[]> {
  await requireStockRole(actorId);
  const parsed = parseOrThrow(registerCopiesSchema, input);
  const lines = await prepareLines(parsed.lines, parsed.shelfId);
  return previewLines(db, lines);
}
