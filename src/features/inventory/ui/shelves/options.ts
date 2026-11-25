import { listShelves } from "@/features/inventory/internal/shelf/service";
import type { Option } from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";

export const searchShelves = async (search: string): Promise<Option[]> =>
  (await listShelves({ search, limit: 20 })).items.map((s) => ({
    id: s.id,
    label: shelfLabel(s),
  }));
