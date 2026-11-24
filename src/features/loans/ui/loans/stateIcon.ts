import type { LoanState } from "@/features/loans/internal/loan/types";
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
