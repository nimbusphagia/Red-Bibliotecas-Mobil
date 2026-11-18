import type { VisitorLine } from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate } from "@/features/shared/format/dates";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";

export default function VisitorLineRow({ line }: { line: VisitorLine }) {
  return (
    <PillRow>
      <Column variant="id" text={`#${line.copyId}`} />
      <Column
        variant="subtitled"
        text={line.bookTitle}
        subtitle1={`Préstamo #${line.loanId}`}
        subtitle2={formatDate(line.createdAt)}
      />
      <Column text={line.labelText ?? undefined} textClass="text-[14px]" />
      <Column
        variant="subtitled"
        subtitle1={line.resolvedAt ? formatDate(line.resolvedAt) : undefined}
      >
        <StatusBadge
          text={line.outcome ? OUTCOME_ES[line.outcome] : "Pendiente"}
          variant={line.outcome ? "active" : "pending"}
        />
      </Column>
      <Column variant="actions" expand={false}>
        <Link href={`/loans/${line.loanId}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={16} color={colors.highlight} />}
          />
        </Link>
      </Column>
    </PillRow>
  );
}
