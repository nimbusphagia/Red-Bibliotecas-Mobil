import { loanStateOf } from "@/features/loans/internal/loan/rules";
import { LOAN_STATE_ES } from "@/features/shared/format/translate";
import type {
  LoanListItem,
  LoanState,
} from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow, Text } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate, formatDateES } from "@/features/shared/format/dates";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, ClockAlert, Eye, Flag } from "lucide-react-native";
import { View } from "react-native";

type Props = { loan: LoanListItem };

const LOAN_BADGE: Record<LoanState, "active" | "pending" | "finished"> = {
  open: "pending",
  overdue: "active",
  closed: "finished",
};

export default function LoanRow({ loan }: Props) {
  const state = loanStateOf(loan);

  return (
    <PillRow className="gap-6">
      <Column text={`#${loan.id}`} variant="id" />
      <Column
        variant="subtitled"
        text={loan.visitorName}
        subtitle1={formatDateES(loan.createdAt)}
      />

      <Column
        variant="subtitled"
        text={`${loan.lineCount - loan.openCount} / ${loan.lineCount}`}
        subtitle1="Devueltos"
      />

      <Column variant="subtitled" subtitle1={formatDateES(loan.expiresBy)}>
        <View className="flex-row items-center gap-1">
          <Text variant="h3" className="text-[14px]">
            {LOAN_STATE_ES[state]}
          </Text>
          {loan.overdue && (
            <Flag size={14} color={colors.highlight} strokeWidth={2.5} />
          )}
        </View>
      </Column>
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[120px] justify-end"
      >
        <Link href={`/loans/${loan.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={16} strokeWidth={2.5} color={colors.primary} />}
          />
        </Link>

        {loan.openCount > 0 && (
          <Link href={`/loans/${loan.id}`} asChild>
            <Button
              variant="primary"
              icon={<BookDown size={16} strokeWidth={2.5} color={colors.bg} />}
            />
          </Link>
        )}
      </Column>
    </PillRow>
  );
}
