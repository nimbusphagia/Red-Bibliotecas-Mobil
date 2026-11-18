import { loanStateOf } from "@/features/loans/internal/loan/rules";
import { LOAN_STATE_ES } from "@/features/shared/format/translate";
import type {
  LoanListItem,
  LoanState,
} from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, ClockAlert, Eye } from "lucide-react-native";
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
        subtitle1={formatDate(loan.createdAt)}
      />

      <Column
        variant="subtitled"
        text={`${loan.lineCount - loan.openCount} / ${loan.lineCount}`}
        subtitle1="Devueltos"
      />

      <Column
        variant="subtitled"
        text={formatISO(loan.expiresBy)}
        subtitle1="Vence"
      >
        {loan.overdue && (
          <ClockAlert size={16} color={colors.highlight} strokeWidth={2.5} />
        )}
      </Column>
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[120px] justify-end"
      >
        {loan.openCount > 0 ? (
          <Link href={`/loans/${loan.id}`} asChild>
            <Button
              variant="primary"
              icon={<BookDown size={16} strokeWidth={2.5} color={colors.bg} />}
            />
          </Link>
        ) : (
          <StatusBadge
            text={LOAN_STATE_ES[state]}
            variant={LOAN_BADGE[state]}
          />
        )}
        <Link href={`/loans/${loan.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={16} strokeWidth={2.5} color={colors.primary} />}
          />
        </Link>
      </Column>
    </PillRow>
  );
}
