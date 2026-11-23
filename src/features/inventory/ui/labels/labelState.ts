import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  CircleCheck,
  CircleDashedCheck,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react-native";

export type LabelState = "pending" | "labeled" | "outdated";

export const labelStateOf = (
  c: Pick<CopyItem, "labeledAt" | "outdated">,
): LabelState =>
  c.labeledAt === null ? "pending" : c.outdated ? "outdated" : "labeled";

export const LABEL_STATE_ICON: Record<LabelState, LucideIcon> = {
  labeled: CircleCheck,
  pending: CircleDashedCheck,
  outdated: TriangleExclamationPoint,
};
