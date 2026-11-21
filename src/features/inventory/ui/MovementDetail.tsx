import {
  getMovement,
  listMovementLines,
} from "@/features/inventory/internal/movement/service";
import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import { getLoan } from "@/features/loans/internal/loan/service";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import { loanDetailRows } from "@/features/loans/ui/loans/detail/loanRows";
import {
  Button,
  DetailColumns,
  ItemList,
  PageHeader,
  Text,
  type DetailColumn,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import {
  MOVEMENT_REASON_ES,
  MOVEMENT_TYPE_ES,
} from "@/features/shared/format/translate";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import MovementLineRow from "./movements/detail/MovementLineRow";

const PAGE_SIZE = 20;

export default function MovementDetail({ id }: { id: string }) {
  const movementId = routeIdSchema.parse(id);
  const [movement, setMovement] = useState<MovementListItem | null>(null);
  const [loan, setLoan] = useState<LoanListItem | null>(null);

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
        <Link href={`/loans/${loan.id}`} asChild>
          <Button variant="ghost" size="sm" icon={Eye} />
        </Link>
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
        lead={<Text variant="item">{MOVEMENT_TYPE_ES[movement.type]}</Text>}
      />
      <DetailColumns columns={columns} />
      {!loanLine && (
        <ItemList
          columns={2}
          toolbar={<Text variant="section">Ejemplares</Text>}
          items={list.items}
          loading={list.loading}
          onEndReached={list.loadMore}
          renderItem={(line) => (
            <MovementLineRow line={line} movementType={movement.type} />
          )}
        />
      )}
    </>
  );
}
