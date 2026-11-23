import type { LoanState } from "@/features/loans/internal/loan/types";
import {
  CalendarClock,
  CircleCheck,
  CircleDashedCheck,
  type LucideIcon,
} from "lucide-react-native";

export const LOAN_STATE_ICON: Record<LoanState, LucideIcon> = {
  open: CircleDashedCheck,
  overdue: CalendarClock,
  closed: CircleCheck,
};
