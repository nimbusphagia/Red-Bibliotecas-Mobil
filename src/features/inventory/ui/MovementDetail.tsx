import { useSession } from "@/features/account/internal/session";
import {
  getMovement,
  listMovementLines,
} from "@/features/inventory/internal/movement/service";
import {
  EXIT_STATUS,
  RECOVERABLE_REASONS,
  type MovementLine,
  type MovementListItem,
} from "@/features/inventory/internal/movement/types";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";
import { getLoan } from "@/features/loans/internal/loan/service";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import { loanDetailRows } from "@/features/loans/ui/loans/detail/loanRows";
import {
  Button,
  DetailColumns,
  ItemList,
  PageHeader,
  Panel,
  StatusIndicator,
  type DetailColumn,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import {
  MOVEMENT_REASON_ES,
  MOVEMENT_TYPE_ES,
} from "@/features/shared/format/translate";
import { PAGE_SIZE } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { Link, useRouter } from "expo-router";
import { ArrowUpRight, Eye, RotateCcwClock } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import MovementLineRow from "./movements/detail/MovementLineRow";
import RecoverCopyDialog from "./copies/RecoverCopyDialog";

export default function MovementDetail({ id }: { id: string }) {
  const movementId = routeIdSchema.parse(id);
  const router = useRouter();
  const session = useSession();
  const [movement, setMovement] = useState<MovementListItem | null>(null);
  const [loan, setLoan] = useState<LoanListItem | null>(null);
  const [recovering, setRecovering] = useState<MovementLine | null>(null);

  useEffect(() => {
    getMovement(movementId).then(setMovement);
  }, [movementId]);

  const fetchPage = useCallback(
    (offset: number) =>
      listMovementLines({ movementId, limit: PAGE_SIZE, offset }),
    [movementId],
  );

  const list = useInfiniteList(fetchPage);

  const loanLine = list.items.find((l) => l.loanId !== null);
  const loanId = loanLine?.loanId ?? null;

  useEffect(() => {
    if (loanId === null) {
      setLoan(null);
      return;
    }
    getLoan(loanId).then(setLoan);
  }, [loanId]);

  if (!movement) return <ActivityIndicator />;

  const actorId =
    session.status === "signed-in" && canManageStock(session.account.role)
      ? session.account.id
      : null;
  // Solo en la salida que la recuperación revertiría: la última abierta.
  const reversible = RECOVERABLE_REASONS.find((r) => r === movement.reason);
  const recoverOf = (line: MovementLine) =>
    actorId !== null &&
    reversible !== undefined &&
    line.recoveryId === null &&
    line.status === EXIT_STATUS[reversible]
      ? () => setRecovering(line)
      : undefined;
  const loanRecover = loanLine ? recoverOf(loanLine) : undefined;

  const columns: DetailColumn[] = [
    {
      title: "Detalles",
      rows: [
        { label: "Motivo", content: MOVEMENT_REASON_ES[movement.reason] },
        { label: "Firmado por", content: movement.signedByUsername },
        { label: "Fecha", content: formatDate(movement.createdAt) },
        { label: "Ejemplares", content: String(movement.copyCount) },
        { label: "Notas", content: movement.notes ?? "---" },
      ],
    },
  ];

  if (loan && loanLine) {
    columns.push({
      title: "Préstamo",
      lead: (
        <>
          {loanRecover && (
            <Button
              variant="soft"
              size="sm"
              icon={RotateCcwClock}
              onPress={loanRecover}
            />
          )}
          {loanLine.recoveryId !== null && (
            <Link href={`/stock/${loanLine.recoveryId}`} asChild>
              <Button variant="soft" size="sm" icon={ArrowUpRight} />
            </Link>
          )}
          <Link href={`/loans/${loan.id}`} asChild>
            <Button variant="soft" size="sm" icon={Eye} />
          </Link>
        </>
      ),
      rows: [
        { label: "Prestado a", content: loan.visitorName },
        {
          label: "Ejemplar",
          content: `${loanLine.bookTitle} #${loanLine.copyId}`,
        },
        ...loanDetailRows(loan, { withState: false }),
      ],
    });
  }

  return (
    <>
      <PageHeader
        title={`Movimiento #${movement.id}`}
        lead={<StatusIndicator text={MOVEMENT_TYPE_ES[movement.type]} />}
      />
      <DetailColumns columns={columns} />
      {!loanLine && (
        <Panel title="Ejemplares" className="flex-1">
          <ItemList
            items={list.items}
            loading={list.loading}
            onEndReached={list.loadMore}
            renderItem={(line) => (
              <MovementLineRow
                line={line}
                canOpenBook={
                  movement.type === "entry" && line.status === "available"
                }
                onRecover={recoverOf(line)}
              />
            )}
          />
        </Panel>
      )}
      {recovering && actorId !== null && (
        <RecoverCopyDialog
          copy={recovering}
          actorId={actorId}
          onClose={() => setRecovering(null)}
          onDone={(recoveryId) => {
            setRecovering(null);
            list.reload();
            router.push(`/stock/${recoveryId}`);
          }}
        />
      )}
    </>
  );
}
