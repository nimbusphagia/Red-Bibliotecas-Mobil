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

export const copyOption = (
  id: number,
  labelText: string | null,
  title: string,
): Option => ({ id, label: `${labelText ?? `#${id}`} · ${title}` });

export async function copyByLabel(text: string): Promise<Option | null> {
  const c = await findCopyByLabel(text);
  return c && copyOption(c.id, c.labelText, c.title);
}

export async function copyById(text: string): Promise<Option | null> {
  const id = Number(text);
  if (!Number.isInteger(id) || id <= 0) return null;
  const c = await getCopy(id).catch(() => null);
  return c && copyOption(c.id, c.labelText, c.bookTitle);
}
