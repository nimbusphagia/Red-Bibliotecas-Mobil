import type { LoanLine } from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate } from "@/features/shared/format/dates";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { BookDown, Flag } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import ReturnLineDialog from "./ReturnLineDialog";

type Props = {
  lines: LoanLine[];
  actorId: number;
  onChanged: () => void;
};

export default function LoanLines({ lines, actorId, onChanged }: Props) {
  const [active, setActive] = useState<{
    line: LoanLine;
    reportOnly: boolean;
  } | null>(null);

  return (
    <View className="gap-2 ">
      {lines.map((l) => (
        <PillRow key={l.id} className="py-1">
          <Column text={`#${l.copyId}`} variant="id" />
          <Column variant="subtitled" text={l.bookTitle} subtitle1={"Autor"} />
          <Column text={l.labelText ?? undefined} textClass="text-[14px]" />
          <Column
            variant="subtitled"
            subtitle1={l.resolvedAt ? formatDate(l.resolvedAt) : undefined}
          >
            <StatusBadge
              text={l.outcome ? OUTCOME_ES[l.outcome] : "Pendiente"}
              variant={l.outcome ? "active" : "pending"}
            />
          </Column>
          <Column variant="actions" expand={false} containerClass="w-[180px]">
            {!l.outcome && (
              <>
                <Button
                  title="Devolver"
                  variant="secondary"
                  icon={
                    <BookDown
                      size={16}
                      color={colors.primary}
                      strokeWidth={2}
                    />
                  }
                  onPress={() => setActive({ line: l, reportOnly: false })}
                />
                <Button
                  variant="secondary"
                  icon={
                    <Flag size={16} color={colors.primary} strokeWidth={2} />
                  }
                  onPress={() => setActive({ line: l, reportOnly: true })}
                />
              </>
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
