import type { CopyItem } from "@/features/inventory/internal/copy/types";

export type LabelState = "pending" | "labeled" | "outdated";

export const labelStateOf = (
  c: Pick<CopyItem, "labeledAt" | "outdated">,
): LabelState =>
  c.labeledAt === null ? "pending" : c.outdated ? "outdated" : "labeled";

export const BADGE_VARIANT = {
  pending: "pending",
  outdated: "pending",
  labeled: "active",
} as const;
