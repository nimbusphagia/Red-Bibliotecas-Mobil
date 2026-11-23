import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { listShelves } from "@/features/inventory/internal/shelf/service";
import type { Option } from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";

export type MoveCopy = {
  id: number;
  labelText: string | null;
  title: string;
  shelfId: number;
  shelfName: string;
};

export const searchShelves = async (search: string): Promise<Option[]> =>
  (await listShelves({ search, limit: 20 })).items.map((s) => ({
    id: s.id,
    label: shelfLabel(s),
  }));

export const toMoveCopy = (c: CopyItem): MoveCopy => ({
  id: c.id,
  labelText: c.labelText,
  title: c.bookTitle,
  shelfId: c.shelfId,
  shelfName: shelfLabel({ name: c.shelfName, isDefault: c.shelfIsDefault }),
});

