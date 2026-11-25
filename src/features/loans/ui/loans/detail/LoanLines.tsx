import RecoverCopyDialog from "@/features/inventory/ui/copies/RecoverCopyDialog";
import { canRecover } from "@/features/inventory/ui/copies/canRecover";
import type { LoanLine } from "@/features/loans/internal/loan/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import {
  ArrowDown,
  ArrowUpRight,
  RotateCcwClock,
  TriangleExclamationPoint,
} from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import ReturnLineDialog from "./ReturnLineDialog";

type Props = {
  lines: LoanLine[];
  overdue: boolean;
  actorId: number;
  canManageStock: boolean;
  onChanged: () => void;
};

export default function LoanLines({
  lines,
  overdue,
  actorId,
  canManageStock,
  onChanged,
}: Props) {
  const [active, setActive] = useState<{
    line: LoanLine;
    reportOnly: boolean;
  } | null>(null);
  const [recovering, setRecovering] = useState<LoanLine | null>(null);

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
            text={l.resolvedAt ? formatDateES(l.resolvedAt) : "---"}
            subtitle1={
              l.outcome
                ? OUTCOME_ES[l.outcome]
                : overdue
                  ? "Vencido"
                  : "Pendiente"
            }
          />
          <Column variant="actions" width="lg">
            {!l.outcome ? (
              <>
                <Button
                  variant="soft"
                  accent={overdue ? "neg" : undefined}
                  size={overdue ? "sm" : "md"}
                  weight={overdue ? "md" : "sm"}
                  icon={TriangleExclamationPoint}
                  title={overdue ? "Reportar" : undefined}
                  onPress={() => setActive({ line: l, reportOnly: true })}
                />
                <Button
                  variant="soft"
                  accent={overdue ? undefined : "sm"}
                  size={overdue ? "md" : "sm"}
                  weight={overdue ? "sm" : "md"}
                  icon={ArrowDown}
                  title={overdue ? undefined : "Devolver"}
                  onPress={() => setActive({ line: l, reportOnly: false })}
                />
              </>
            ) : (
              <>
                {canManageStock && canRecover(l.status) && (
                  <Button
                    variant="soft"
                    size="sm"
                    weight="md"
                    icon={RotateCcwClock}
                    title="Recuperar"
                    onPress={() => setRecovering(l)}
                  />
                )}
                {l.recoveryId !== null && (
                  <Link href={`/stock/${l.recoveryId}`} asChild>
                    <Button variant="soft" icon={ArrowUpRight} />
                  </Link>
                )}
              </>
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
      {recovering && (
        <RecoverCopyDialog
          copy={recovering}
          actorId={actorId}
          onClose={() => setRecovering(null)}
          onDone={() => {
            setRecovering(null);
            onChanged();
          }}
        />
      )}
    </View>
  );
}
