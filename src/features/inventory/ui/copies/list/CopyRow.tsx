import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  ListRow,
} from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import {
  ArrowDown,
  ArrowUp,
  RotateCcwClock,
  SendToBack,
  ShelvingUnit,
} from "lucide-react-native";
import { useState } from "react";
import PrintLabelsDialog from "../../labels/form/PrintLabelsDialog";
import { LABEL_STATE_ICON, labelStateOf } from "../../labels/labelState";
import MoveCopyDialog from "../../shelves/form/MoveCopyDialog";
import { canRecover } from "../canRecover";
import RecoverCopyDialog from "../RecoverCopyDialog";

type Dialog = "print" | "move" | "recover" | null;

type Props = {
  copy: CopyItem;
  /** Usuario que puede mover y recuperar; null si no tiene permiso. */
  actorId: number | null;
  onChanged: () => void;
};

export default function CopyRow({ copy, actorId, onChanged }: Props) {
  const state = labelStateOf(copy);
  const [dialog, setDialog] = useState<Dialog>(null);
  const isAvailable = ["available", "damaged"].includes(copy.status);
  const loanHref = isAvailable
    ? {
        pathname: "/loans/new" as const,
        params: { copyId: String(copy.id) },
      }
    : copy.loan && (`/loans/${copy.loan.loanId}` as const);
  const done = () => {
    setDialog(null);
    onChanged();
  };

  return (
    <>
      <ListRow>
        <Column variant="id" text={`#${copy.id}`} />
        <Column text={copy.labelText ?? "---"} />
        <Column>
          <Link href={`/shelves/${copy.shelfId}`} asChild>
            <Button
              variant="ghost"
              size="sm"
              weight="md"
              icon={ShelvingUnit}
              title={shelfLabel({
                name: copy.shelfName,
                isDefault: copy.shelfIsDefault,
              })}
              className="-ml-4 shrink"
            />
          </Link>
        </Column>
        <Column
          variant="actions"
          expand={false}
          containerClass="shrink-0 items-center justify-end gap-2"
        >
          {actorId !== null && canRecover(copy.status) && (
            <Button
              variant="soft"
              icon={RotateCcwClock}
              onPress={() => setDialog("recover")}
            />
          )}
          {actorId !== null && (
            <Button
              variant="soft"
              icon={SendToBack}
              onPress={() => setDialog("move")}
            />
          )}
          {loanHref && (
            <Link href={loanHref} asChild>
              <Button
                variant="soft"
                icon={isAvailable ? ArrowUp : ArrowDown}
              />
            </Link>
          )}
          {state === "labeled" ? (
            <Button
              variant="soft"
              size="sm"
              icon={LABEL_STATE_ICON[state]}
              title="Imprimir"
              onPress={() => setDialog("print")}
            />
          ) : (
            <Link
              href={{ pathname: "/copies/mark", params: { copyId: copy.id } }}
              asChild
            >
              <Button
                variant="soft"
                size="sm"
                icon={LABEL_STATE_ICON[state]}
                title={state === "outdated" ? "Actualizar" : "Etiquetar"}
              />
            </Link>
          )}
        </Column>
      </ListRow>
      {dialog === "print" && (
        <PrintLabelsDialog
          initial={[copy]}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "move" && (
        <MoveCopyDialog
          copy={copy}
          currentShelfId={copy.shelfId}
          onClose={() => setDialog(null)}
          onMoved={done}
        />
      )}
      {dialog === "recover" && actorId !== null && (
        <RecoverCopyDialog
          copy={{ ...copy, copyId: copy.id }}
          actorId={actorId}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      )}
    </>
  );
}
