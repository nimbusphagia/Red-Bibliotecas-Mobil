import type { ACCOUNT_ROLES } from "@/db/schema";
import { requireActive } from "@/features/account/internal/service";
import { ForbiddenError } from "@/features/shared/errors/errors";

const STOCK_ROLES: readonly (typeof ACCOUNT_ROLES)[number][] = [
  "owner",
  "admin",
];

export async function requireStockRole(actorId: number, action: string) {
  const actor = await requireActive(actorId);
  if (!STOCK_ROLES.includes(actor.role)) {
    throw new ForbiddenError(action);
  }
  return actor;
}
