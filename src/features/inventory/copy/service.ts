import { db } from "@/db/client";
import { collapse } from "@/shared/format/text";
import { findCopyByActiveLabelSync } from "./repository";
import type { CopyLookup } from "./types";

export async function findCopyByLabel(
  text: string,
): Promise<CopyLookup | null> {
  const clean = collapse(text);
  if (!clean) return null;
  return findCopyByActiveLabelSync(db, clean);
}
