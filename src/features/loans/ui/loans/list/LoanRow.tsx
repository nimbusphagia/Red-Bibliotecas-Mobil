import { loanStateOf } from "@/features/loans/internal/loan/rules";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import {
  gradeLabel,
  LOAN_STATE_ES,
  ROLE_ES,
} from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye, ScanSearch } from "lucide-react-native";
import { View } from "react-native";
import { LOAN_STATE_ICON } from "../stateIcon";

type Props = {
  loan: LoanListItem;
  inset?: boolean;
  external?: boolean;
  /** Sin la columna de estado, para espacios angostos. */
  compact?: boolean;
};

export default function LoanRow({ loan, inset, external, compact }: Props) {
  const state = loanStateOf(loan);

  return (
    <ListRow inset={inset}>
      <Column
        variant="subtitled"
        width="lg"
        text={`Préstamo #${loan.id}`}
        subtitle1={formatDateES(loan.createdAt)}
      />
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
      <Column
        variant="subtitled"
        text={`${loan.lineCount - loan.openCount} / ${loan.lineCount}`}
        subtitle1="Devueltos"
      />
      {!compact && (
        <Column variant="subtitled" subtitle1={formatDateES(loan.expiresBy)}>
          <View className="flex-row items-center gap-2">
            <Icon icon={LOAN_STATE_ICON[state]} size="lg" />
            <Text variant="itemSm">{LOAN_STATE_ES[state]}</Text>
          </View>
        </Column>
      )}
      <Column variant="actions" expand={false}>
        <Link href={`/loans/${loan.id}`} asChild>
          <Button variant="soft" icon={external ? ScanSearch : Eye} size="md" />
        </Link>
      </Column>
    </ListRow>
  );
}
