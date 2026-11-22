import type { VisitorLine } from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  ListRow,
  StatusBadge,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";

export default function VisitorLineRow({ line }: { line: VisitorLine }) {
  return (
    <ListRow>
      <Column variant="id" text={`#${line.loanId}`} />
      <Column
        variant="subtitled"
        text={line.bookTitle}
        subtitle1={formatDate(line.createdAt)}
      />
      <Column variant="subtitled" text={line.labelText ?? undefined} />
      <Column
        variant="subtitled"
        text={line.resolvedAt ? formatDate(line.resolvedAt) : "---"}
        subtitle1="Finalizó"
      />
      <Column variant="actions" width="lg">
        <StatusBadge
          text={line.outcome ? OUTCOME_ES[line.outcome] : "Pendiente"}
          variant={line.outcome ? "active" : "pending"}
        />
        <Link href={`/loans/${line.loanId}`} asChild>
          <Button variant="soft" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
