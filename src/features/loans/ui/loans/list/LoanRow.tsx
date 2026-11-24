import { loanStateOf } from "@/features/loans/internal/loan/rules";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import { Button, Column, Icon, ListRow } from "@/features/shared/components";
import { formatDateRangeES } from "@/features/shared/format/dates";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { Link } from "expo-router";
import { ArrowDown, ChevronRight } from "lucide-react-native";
import { LOAN_STATE_ICON } from "../stateIcon";

type Props = {
  loan: LoanListItem;
  inset?: boolean;
  external?: boolean;
  hideVisitor?: boolean;
};

export default function LoanRow({
  loan,
  inset,
  external,
  hideVisitor,
}: Props) {
  const state = loanStateOf(loan);
  const { isCompact } = useLayoutMode();

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
      <Column
        width={isCompact ? "sm" : "md"}
        text={`${loan.lineCount - loan.openCount}/${loan.lineCount}`}
      />
      <Column
        variant="actions"
        expand={false}
        containerClass="w-36 shrink-0 items-center justify-end gap-3"
      >
        <Icon icon={LOAN_STATE_ICON[state]} size="lg" stroke="sm" />
        <Link href={`/loans/${loan.id}`} asChild>
          {external ? (
            <Button
              variant="soft"
              icon={ChevronRight}
              className="bg-transparent"
            />
          ) : (
            <Button
              variant="soft"
              size="sm"
              icon={ArrowDown}
              title="Devolver"
            />
          )}
        </Link>
      </Column>
    </ListRow>
  );
}
