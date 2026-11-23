import type { LoanLine } from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  StatusBadge,
} from "@/features/shared/components";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import {
  ArrowDown,
  CircleCheck,
  TriangleExclamationPoint,
} from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import ReturnLineDialog from "./ReturnLineDialog";

type Props = {
  lines: LoanLine[];
  expiresBy: string;
  overdue: boolean;
  actorId: number;
  onChanged: () => void;
};

export default function LoanLines({
  lines,
  expiresBy,
  overdue,
  actorId,
  onChanged,
}: Props) {
  const [active, setActive] = useState<{
    line: LoanLine;
    reportOnly: boolean;
  } | null>(null);

  return (
    <View className="gap-2 ">
      {lines.map((l) => (
        <ListRow key={l.id}>
          <Column text={`#${l.copyId}`} variant="id" />
          <Column
            variant="subtitled"
            text={l.bookTitle}
            subtitle1={l.labelText ?? undefined}
          />
          <Column
            variant="subtitled"
            text={expiresBy}
            subtitle1={l.outcome ? "Finalizado" : overdue ? "Vencido" : "Vence"}
          />
          <Column variant="actions" width="lg">
            {!l.outcome ? (
              <>
                <Button
                  variant="soft"
                  icon={TriangleExclamationPoint}
                  onPress={() => setActive({ line: l, reportOnly: true })}
                />
                <Button
                  variant="accent"
                  size="sm"
                  weight="md"
                  icon={ArrowDown}
                  onPress={() => setActive({ line: l, reportOnly: false })}
                />
              </>
            ) : l.outcome === "returned" ? (
              <Icon icon={CircleCheck} size="lg" stroke="sm" />
            ) : (
              <StatusBadge text={OUTCOME_ES[l.outcome]} variant="active" />
            )}
          </Column>
        </ListRow>
      ))}
      {active && (
        <ReturnLineDialog
          line={active.line}
          reportOnly={active.reportOnly}
          actorId={actorId}
          onClose={() => setActive(null)}
          onDone={() => {
            setActive(null);
            onChanged();
          }}
        />
      )}
    </View>
  );
}
