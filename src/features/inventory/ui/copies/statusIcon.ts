import type { CopyStatus } from "@/features/inventory/internal/copy/types";
import type { AccentLevel } from "@/features/shared/theme";
import {
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  ClipboardClock,
  ShieldExclamationPoint,
  type LucideIcon,
} from "lucide-react-native";

export const COPY_STATUS_ICON: Record<CopyStatus, LucideIcon> = {
  available: CircleCheck,
  on_loan: ClipboardClock,
  damaged: ShieldExclamationPoint,
  lost: CircleQuestionMark,
  discarded: CircleX,
};

export const COPY_STATUS_ACCENT: Partial<Record<CopyStatus, AccentLevel>> = {
  available: "sm",
  on_loan: "md",
  damaged: "md",
  lost: "neg",
};
