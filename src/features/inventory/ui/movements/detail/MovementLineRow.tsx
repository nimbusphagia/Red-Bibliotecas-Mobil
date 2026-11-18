import type { MovementLine } from "@/features/inventory/internal/movement/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";

type Props = { line: MovementLine };

export default function MovementLineRow({ line }: Props) {
  return (
    <PillRow className="gap-6 py-1">
      <Column text={`#${line.copyId}`} variant="id" />
      <Column
        variant="subtitled"
        text={line.bookTitle}
        subtitle1={`Ejemplar ${line.copyNumber}`}
      />
      <Column text={line.labelText ?? "---"} textClass="text-[14px]" />
      <Column variant="actions">
        <StatusBadge text={COPY_STATUS_ES[line.status]} variant="active" />
      </Column>
      <Column
        variant="subtitled"
        text={line.loanId ? `Préstamo #${line.loanId}` : undefined}
        subtitle1={line.visitorName ?? undefined}
      />
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[48px] justify-end"
      >
        {line.loanId && (
          <Link href={`/loans/${line.loanId}`} asChild>
            <Button
              variant="secondary"
              icon={<Eye size={16} color={colors.highlight} />}
            />
          </Link>
        )}
      </Column>
    </PillRow>
  );
}
