import { useSession } from "@/features/account/internal/session";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";

export function useCanManageStock(): boolean {
  const session = useSession();
  return session.status === "signed-in" && canManageStock(session.account.role);
}
