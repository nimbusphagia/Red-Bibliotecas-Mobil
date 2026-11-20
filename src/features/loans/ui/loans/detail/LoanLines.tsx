import type { LoanLine } from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { BookDown, Flag } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import ReturnLineDialog from "./ReturnLineDialog";

type Props = {
  lines: LoanLine[];
  expiresBy: string;
  actorId: number;
  onChanged: () => void;
};

export default function LoanLines({
  lines,
  expiresBy,
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
        <PillRow key={l.id} className="py-2">
          <Column text={`#${l.copyId}`} variant="id" />
          <Column
            variant="subtitled"
            text={l.bookTitle}
            subtitle1={l.labelText ?? undefined}
          />
          <Column
            variant="subtitled"
            text={expiresBy}
            subtitle1={l.outcome ? "Finalizado" : "Vence"}
          />
          <Column variant="actions" expand={false} containerClass="w-[180px]">
            {!l.outcome ? (
              <>
                <Button
                  variant="secondary"
                  icon={Flag}
                  onPress={() => setActive({ line: l, reportOnly: true })}
                />

                <Button
                  title="Devolver"
                  variant="primary"
                  icon={BookDown}
                  onPress={() => setActive({ line: l, reportOnly: false })}
                />
              </>
            ) : (
              <StatusBadge
                text={l.outcome ? OUTCOME_ES[l.outcome] : "Pendiente"}
                variant={"active"}
              />
            )}
          </Column>
        </PillRow>
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
