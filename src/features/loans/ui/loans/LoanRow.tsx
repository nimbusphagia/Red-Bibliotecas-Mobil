import type { LoanListItem } from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, ClockAlert, Eye } from "lucide-react-native";

type Props = { loan: LoanListItem };

export default function LoanRow({ loan }: Props) {
  return (
    <PillRow className="gap-6">
      <Column text={`#${loan.id}`} variant="id" />
      <Column
        variant="subtitled"
        text={loan.visitorName}
        subtitle1={formatDate(loan.createdAt)}
        containerClass="max-w-[150]"
      />
      <Column variant="actions">
        <StatusBadge
          text={loan.overdue ? "Vencido" : "Activo"}
          variant={"pending"}
        />
      </Column>

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
        variant="subtitled"
        text={`${loan.lineCount - loan.openCount} / ${loan.lineCount}`}
        subtitle1="Devueltos"
      />
      <Column variant="actions" expand={false}>
        <Link href={`/loans/${loan.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={18} color={colors.highlight} />}
          />
        </Link>
        {loan.openCount > 0 && (
          <Button
            variant="secondary"
            icon={<BookDown size={18} color={colors.highlight} />}
          />
        )}
      </Column>
    </PillRow>
  );
}
