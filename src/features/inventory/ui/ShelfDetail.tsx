import {
  getShelf,
  listShelfCopies,
} from "@/features/inventory/internal/shelf/service";
import type {
  Shelf,
  ShelfCopy,
} from "@/features/inventory/internal/shelf/types";
import {
  DetailColumns,
  ItemList,
  PageHeader,
  Text,
  type DetailColumn,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import { shelfLabel } from "@/features/shared/format/translate";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import ShelfCopyRow from "./shelves/detail/ShelfCopyRow";
import MoveCopyDialog from "./shelves/form/MoveCopyDialog";

const PAGE_SIZE = 20;

export default function ShelfDetail({ id }: { id: string }) {
  const shelfId = routeIdSchema.parse(id);
  const [moving, setMoving] = useState<ShelfCopy | null>(null);
  const [shelf, setShelf] = useState<Shelf | null>(null);

  useEffect(() => {
    getShelf(shelfId).then(setShelf);
  }, [shelfId]);

  const fetchPage = useCallback(
    (offset: number) => listShelfCopies({ shelfId, limit: PAGE_SIZE, offset }),
    [shelfId],
  );

  const list = useInfiniteList(fetchPage);

  if (!shelf) return <ActivityIndicator />;

  const firstLoad = list.loading && list.items.length === 0;

  const columns: DetailColumn[] = [
    {
      title: "Detalles",
      rows: [
        { label: "Nombre", content: shelfLabel(shelf) },
        { label: "Descripción", content: shelf.description ?? "---" },
        {
          label: "Ejemplares",
          content: firstLoad ? "---" : String(list.total),
        },
        { label: "Creada", content: formatDate(shelf.createdAt) },
      ],
    },
  ];

  return (
    <>
      <PageHeader title={shelfLabel(shelf)} />
      <DetailColumns columns={columns} />
      <ItemList
        columns={2}
        toolbar={<Text variant="section">Ejemplares</Text>}
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(copy) => (
          <ShelfCopyRow copy={copy} onMove={() => setMoving(copy)} />
        )}
      />
      {moving && (
        <MoveCopyDialog
          copy={moving}
          currentShelfId={shelfId}
          onClose={() => setMoving(null)}
          onMoved={() => {
            setMoving(null);
            list.reload();
          }}
        />
      )}
    </>
  );
}
