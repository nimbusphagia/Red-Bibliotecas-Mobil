import { requireAccount } from "@/features/account/internal/service";
import type { AccountRole } from "@/features/account/internal/types";
import { ForbiddenError } from "@/features/shared/errors/errors";

const STOCK_ROLES: readonly AccountRole[] = ["admin", "librarian"];

export const canManageStock = (role: AccountRole) => STOCK_ROLES.includes(role);

export async function requireStockRole(actorId: number, action: string) {
  const actor = await requireAccount(actorId);
  if (!canManageStock(actor.role)) {
    throw new ForbiddenError(action);
  }
  return actor;
}
