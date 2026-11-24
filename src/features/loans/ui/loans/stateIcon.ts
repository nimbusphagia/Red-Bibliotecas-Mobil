import type { LoanState } from "@/features/loans/internal/loan/types";
import type { AccentLevel } from "@/features/shared/theme";
import {
  CircleCheck,
  CircleDashed,
  ClockExclamationPoint,
  type LucideIcon,
} from "lucide-react-native";

export const LOAN_STATE_ICON: Record<LoanState, LucideIcon> = {
  open: CircleDashed,
  overdue: ClockExclamationPoint,
  closed: CircleCheck,
};

export const LOAN_STATE_ACCENT: Partial<Record<LoanState, AccentLevel>> = {
  open: "sm",
  overdue: "md",
};
