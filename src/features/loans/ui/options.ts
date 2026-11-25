import { listVisitors } from "@/features/loans/internal/visitor/service";
import type { Option } from "@/features/shared/components";

export const searchVisitors = async (search: string): Promise<Option[]> =>
  (await listVisitors({ search, active: true, limit: 20 })).items.map((v) => ({
    id: v.id,
    label: v.name,
  }));
