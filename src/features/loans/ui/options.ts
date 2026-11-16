import {
  findCopyByLabel,
  getCopy,
} from "@/features/inventory/internal/copy/service";
import { listVisitors } from "@/features/loans/internal/visitor/service";
import type { Option } from "@/features/shared/components";

export const searchVisitors = async (search: string): Promise<Option[]> =>
  (await listVisitors({ search, active: true, limit: 20 })).items.map((v) => ({
    id: v.id,
    label: v.name,
  }));

const copyOption = (
  id: number,
  labelText: string | null,
  title: string,
): Option => ({ id, label: `${labelText ?? `#${id}`} · ${title}` });

export async function searchCopy(text: string): Promise<Option[]> {
  const byLabel = await findCopyByLabel(text);
  if (byLabel) {
    return [copyOption(byLabel.id, byLabel.labelText, byLabel.title)];
  }
  const id = Number(text.trim());
  if (!Number.isInteger(id) || id <= 0) return [];
  const byId = await getCopy(id).catch(() => null);
  return byId ? [copyOption(byId.id, byId.labelText, byId.bookTitle)] : [];
}
