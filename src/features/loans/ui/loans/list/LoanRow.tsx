import { loanStateOf } from "@/features/loans/internal/loan/rules";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  ListRow,
  StatusChip,
} from "@/features/shared/components";
import { formatDateRangeES } from "@/features/shared/format/dates";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { Link } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { LOAN_STATE_ACCENT, LOAN_STATE_ICON } from "../stateIcon";

type Props = {
  loan: LoanListItem;
  inset?: boolean;
  hideVisitor?: boolean;
  hideId?: boolean;
};

export default function LoanRow({ loan, inset, hideVisitor, hideId }: Props) {
  const state = loanStateOf(loan);
  const { isExpanded } = useLayoutMode();

  return (
    <Link href={`/loans/${loan.id}`} asChild>
      <Pressable className="active:opacity-80">
        <ListRow inset={inset}>
          {!hideId && <Column variant="id" text={`#${loan.id}`} />}
          {!hideVisitor && (
            <Column
              variant="subtitled"
              text={loan.visitorName}
              subtitle1={ROLE_ES[loan.visitorRole]}
              subtitle2={
                isExpanded && loan.visitorGrade && loan.visitorLevel
                  ? gradeLabel(loan.visitorGrade, loan.visitorLevel)
                  : undefined
              }
            />
          )}
          <Column text={formatDateRangeES(loan.createdAt, loan.expiresBy)} />
          <Column width={hideVisitor ? undefined : "md"}>
            <StatusChip
              text={`${loan.lineCount - loan.openCount}/${loan.lineCount}`}
              icon={LOAN_STATE_ICON[state]}
              accent={LOAN_STATE_ACCENT[state]}
            />
          </Column>
          <Column variant="actions" width="sm">
            <View pointerEvents="none">
              <Button
                variant="soft"
                icon={ChevronRight}
                className="bg-transparent"
              />
            </View>
          </Column>
        </ListRow>
      </Pressable>
    </Link>
  );
}
