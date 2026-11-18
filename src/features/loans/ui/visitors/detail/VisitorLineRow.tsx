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
      <Column variant="id" text={`#${line.loanId}`} />
      <Column
        variant="subtitled"
        text={line.bookTitle}
        subtitle1={formatDate(line.createdAt)}
      />
      <Column
        variant="subtitled"
        text={line.labelText ?? undefined}
        textClass="text-[14px]"
      />
      <Column
        variant="subtitled"
        text={line.resolvedAt ? formatDate(line.resolvedAt) : "---"}
        subtitle1="Finalizó"
      />
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[200] justify-end"
      >
        <StatusBadge
          text={line.outcome ? OUTCOME_ES[line.outcome] : "Pendiente"}
          variant={line.outcome ? "active" : "pending"}
        />
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
