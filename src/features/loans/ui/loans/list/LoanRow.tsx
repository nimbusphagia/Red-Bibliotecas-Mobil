import { loanStateOf } from "@/features/loans/internal/loan/rules";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  ListRow,
  StatusIcon,
  Text,
} from "@/features/shared/components";
import { formatDateRangeES } from "@/features/shared/format/dates";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { LOAN_STATE_ACCENT, LOAN_STATE_ICON } from "../stateIcon";

type Props = {
  loan: LoanListItem;
  inset?: boolean;
  hideVisitor?: boolean;
};

export default function LoanRow({ loan, inset, hideVisitor }: Props) {
  const state = loanStateOf(loan);

  return (
    <ListRow inset={inset}>
      <Column variant="id" text={`#${loan.id}`} />
      {!hideVisitor && (
        <Column
          variant="subtitled"
          text={loan.visitorName}
          subtitle1={ROLE_ES[loan.visitorRole]}
          subtitle2={
            loan.visitorGrade && loan.visitorLevel
              ? gradeLabel(loan.visitorGrade, loan.visitorLevel)
              : undefined
          }
        />
      )}
      <Column text={formatDateRangeES(loan.createdAt, loan.expiresBy)} />
      <Column width="md" containerClass="gap-2">
        <StatusIcon
          icon={LOAN_STATE_ICON[state]}
          accent={LOAN_STATE_ACCENT[state]}
        />
        <Text variant="itemSm">
          {loan.lineCount - loan.openCount}/{loan.lineCount}
        </Text>
      </Column>
      <Column variant="actions" width="sm">
        <Link href={`/loans/${loan.id}`} asChild>
          <Button
            variant="soft"
            icon={ChevronRight}
            className="bg-transparent"
          />
        </Link>
      </Column>
    </ListRow>
  );
}
