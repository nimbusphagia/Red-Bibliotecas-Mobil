import type { LoanLine } from "@/features/loans/internal/loan/types";
import {
  Button,
  Column,
  ListRow,
  StatusBadge,
} from "@/features/shared/components";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { ArrowDown, Flag } from "lucide-react-native";
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
            subtitle1={l.outcome ? "Finalizado" : "Vence"}
          />
          <Column variant="actions" width="lg">
            {!l.outcome ? (
              <>
                <Button
                  variant="soft"
                  icon={Flag}
                  onPress={() => setActive({ line: l, reportOnly: true })}
                />

                <Button
                  title="Devolver"
                  variant="solid"
                  size="sm"
                  weight="md"
                  icon={ArrowDown}
                  onPress={() => setActive({ line: l, reportOnly: false })}
                />
              </>
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
