import {
  getMovement,
  listMovementLines,
} from "@/features/inventory/internal/movement/service";
import type { MovementListItem } from "@/features/inventory/internal/movement/types";
import {
  DetailRows,
  ItemList,
  PageHeader,
  Section,
  Text,
  type DetailRow,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import {
  MOVEMENT_REASON_ES,
  MOVEMENT_TYPE_ES,
} from "@/features/shared/format/translate";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MovementLineRow from "./movements/detail/MovementLineRow";

const PAGE_SIZE = 20;

export default function MovementDetail({ id }: { id: string }) {
  const movementId = routeIdSchema.parse(id);
  const [movement, setMovement] = useState<MovementListItem | null>(null);

  useEffect(() => {
    getMovement(movementId).then(setMovement);
  }, [movementId]);

  const fetchPage = useCallback(
    (offset: number) =>
      listMovementLines({ movementId, limit: PAGE_SIZE, offset }),
    [movementId],
  );

  const list = useInfiniteList(fetchPage);

  if (!movement) return <ActivityIndicator />;

  const rows: DetailRow[] = [
    { label: "Tipo", content: MOVEMENT_TYPE_ES[movement.type] },
    { label: "Motivo", content: MOVEMENT_REASON_ES[movement.reason] },
    { label: "Firmado por", content: movement.signedByUsername },
    { label: "Fecha", content: formatDate(movement.createdAt) },
    { label: "Ejemplares", content: String(movement.copyCount) },
    { label: "Notas", content: movement.notes ?? "---" },
  ];

  return (
    <>
      <PageHeader title={`Movimiento #${movement.id}`} />
      <View className="p-4">
        <Section title="Detalles">
          <DetailRows rows={rows} />
        </Section>
      </View>
      <ItemList
        toolbar={<Text variant="h2">Ejemplares</Text>}
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(line) => <MovementLineRow line={line} />}
      />
    </>
  );
}
