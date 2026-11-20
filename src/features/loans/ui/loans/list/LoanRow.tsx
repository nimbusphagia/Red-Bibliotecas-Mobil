import { loanStateOf } from "@/features/loans/internal/loan/rules";
import type {
  LoanListItem,
  LoanState,
} from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { LOAN_STATE_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { BookDown, Eye, Flag } from "lucide-react-native";
import { View } from "react-native";

type Props = { loan: LoanListItem };

export default function LoanRow({ loan }: Props) {
  const state = loanStateOf(loan);

  return (
    <ListRow>
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
          <Text variant="item">{LOAN_STATE_ES[state]}</Text>
          {loan.overdue && <Icon icon={Flag} size="sm" tone="highlight" />}
        </View>
      </Column>
      <Column variant="actions" width="md">
        <Link href={`/loans/${loan.id}`} asChild>
          <Button variant="secondary" icon={Eye} />
        </Link>

        {loan.openCount > 0 && (
          <Link href={`/loans/${loan.id}`} asChild>
            <Button variant="primary" icon={BookDown} />
          </Link>
        )}
      </Column>
    </ListRow>
  );
}
