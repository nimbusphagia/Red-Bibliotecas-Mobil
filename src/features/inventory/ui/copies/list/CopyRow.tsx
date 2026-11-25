import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { Link } from "expo-router";
import {
  ArrowDown,
  ArrowUp,
  OctagonExclamationPoint,
  SendToBack,
  ShelvingUnit,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import PrintLabelsDialog from "../../labels/form/PrintLabelsDialog";
import { LABEL_STATE_ICON, labelStateOf } from "../../labels/labelState";
import MoveCopyDialog from "../../shelves/form/MoveCopyDialog";
import DamageCopyDialog from "../DamageCopyDialog";

type Dialog = "print" | "move" | "damage" | null;

type Props = {
  copy: CopyItem;
  /** Usuario que puede mover y marcar deterioros; null si no tiene permiso. */
  actorId: number | null;
  onChanged: () => void;
  /** Mostrar el libro en lugar del estante (en el detalle de un estante). */
  showBook?: boolean;
};

export default function CopyRow({ copy, actorId, onChanged, showBook }: Props) {
  const state = labelStateOf(copy);
  const [dialog, setDialog] = useState<Dialog>(null);
  const { isExpanded } = useLayoutMode();
  // Ancho fijo por acción para que los botones queden alineados entre filas.
  const labelIconOnly = showBook && !isExpanded;
  const slot = {
    move: isExpanded ? "w-28" : "size-9",
    loan: isExpanded ? "w-32" : "size-9",
    label: labelIconOnly ? "size-9" : "w-36",
  };
  const isAvailable = copy.status === "available";
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
        {showBook ? (
          <>
            <Link href={`/catalog/${copy.bookId}`} asChild>
              <Pressable className="flex-1 active:opacity-80">
                <Column
                  variant="subtitled"
                  text={copy.bookTitle}
                  subtitle1={copy.authors ?? undefined}
                />
              </Pressable>
            </Link>
            <Column text={copy.labelText ?? "---"} />
          </>
        ) : (
          <>
            <Column text={copy.labelText ?? "---"} />
            <Column
              width={isExpanded ? undefined : "md"}
              containerClass={isExpanded ? undefined : "w-36"}
            >
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
          </>
        )}
        <Column
          variant="actions"
          expand={false}
          containerClass="shrink-0 items-center justify-end gap-2"
        >
          {actorId !== null && isExpanded && (
            <Button
              variant="soft"
              accent={copy.damagedAt ? "neg" : undefined}
              size="sm"
              weight="md"
              icon={OctagonExclamationPoint}
              title="Reportar"
              className="w-32"
              onPress={() => setDialog("damage")}
            />
          )}
          {actorId !== null && (
            <Button
              variant="soft"
              size={isExpanded ? "sm" : "md"}
              weight={isExpanded ? "md" : "sm"}
              icon={SendToBack}
              title={isExpanded ? "Mover" : undefined}
              className={slot.move}
              onPress={() => setDialog("move")}
            />
          )}
          {loanHref ? (
            <Link href={loanHref} asChild>
              <Button
                variant="soft"
                accent={isAvailable ? undefined : "sm"}
                size={isExpanded ? "sm" : "md"}
                weight={isExpanded ? "md" : "sm"}
                icon={isAvailable ? ArrowUp : ArrowDown}
                title={
                  isExpanded
                    ? isAvailable
                      ? "Prestar"
                      : "Devolver"
                    : undefined
                }
                className={slot.loan}
              />
            </Link>
          ) : (
            <View className={slot.loan} />
          )}
          {state === "labeled" ? (
            <Button
              variant="soft"
              size={labelIconOnly ? "md" : "sm"}
              weight={labelIconOnly ? "sm" : undefined}
              icon={LABEL_STATE_ICON[state]}
              title={labelIconOnly ? undefined : "Imprimir"}
              className={slot.label}
              onPress={() => setDialog("print")}
            />
          ) : (
            <Link
              href={{ pathname: "/catalog/label", params: { copyId: copy.id } }}
              asChild
            >
              <Button
                variant="soft"
                accent={
                  state === "outdated" ? "neg" : showBook ? "sm" : undefined
                }
                size={labelIconOnly ? "md" : "sm"}
                weight={labelIconOnly ? "sm" : undefined}
                icon={LABEL_STATE_ICON[state]}
                title={
                  labelIconOnly
                    ? undefined
                    : state === "outdated"
                      ? "Actualizar"
                      : "Etiquetar"
                }
                className={slot.label}
              />
            </Link>
          )}
        </Column>
      </ListRow>
      {dialog === "print" && (
        <PrintLabelsDialog initial={[copy]} onClose={() => setDialog(null)} />
      )}
      {dialog === "move" && (
        <MoveCopyDialog
          copy={copy}
          currentShelfId={copy.shelfId}
          onClose={() => setDialog(null)}
          onMoved={done}
        />
      )}
      {dialog === "damage" && actorId !== null && (
        <DamageCopyDialog
          copy={copy}
          actorId={actorId}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      )}
    </>
  );
}
