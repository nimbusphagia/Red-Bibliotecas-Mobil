import {
  getShelf,
  listShelfCopies,
} from "@/features/inventory/internal/shelf/service";
import type {
  Shelf,
  ShelfCopy,
} from "@/features/inventory/internal/shelf/types";
import {
  Button,
  ItemList,
  PageHeader,
  Panel,
  Searchbar,
} from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { PAGE_SIZE, useSearch } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useCallback, useEffect, useState } from "react";
import { PencilLine } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import ShelfCopyRow from "./shelves/detail/ShelfCopyRow";
import MoveCopyDialog from "./shelves/form/MoveCopyDialog";
import ShelfDialog from "./shelves/form/ShelfDialog";

export default function ShelfDetail({ id }: { id: string }) {
  const shelfId = routeIdSchema.parse(id);
  const [moving, setMoving] = useState<ShelfCopy | null>(null);
  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [editing, setEditing] = useState(false);
  const { search, setSearch, debouncedSearch } = useSearch();
  const [idText, setIdText] = useState("");
  const copyId = useDebounce(idText);

  useEffect(() => {
    getShelf(shelfId).then(setShelf);
  }, [shelfId]);

  const fetchPage = useCallback(
    (offset: number) =>
      listShelfCopies({
        shelfId,
        search: debouncedSearch,
        copyId: copyId ? Number(copyId) : undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    [shelfId, debouncedSearch, copyId],
  );

  const list = useInfiniteList(fetchPage);

  if (!shelf) return <ActivityIndicator />;

  return (
    <>
      <PageHeader
        title={shelfLabel(shelf)}
        subtitle={shelf.description ?? undefined}
        lead={
          !shelf.isDefault && (
            <Button
              title="Editar"
              icon={PencilLine}
              size="sm"
              weight="md"
              onPress={() => setEditing(true)}
            />
          )
        }
      />
      <Panel
        title="Ejemplares"
        className="flex-1"
        lead={
          <View className="h-10 flex-1 flex-row justify-end gap-3">
            <Searchbar
              className="flex-1"
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por título o tejuelo..."
            />
            <Searchbar
              className="w-28"
              value={idText}
              onChangeText={(t) => setIdText(t.replace(/\D/g, ""))}
              placeholder="#ID"
            />
          </View>
        }
      >
        <ItemList
          items={list.items}
          loading={list.loading}
          onEndReached={list.loadMore}
          renderItem={(copy) => (
            <ShelfCopyRow copy={copy} onMove={() => setMoving(copy)} />
          )}
        />
      </Panel>
      {editing && (
        <ShelfDialog
          shelf={shelf}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            getShelf(shelfId).then(setShelf);
          }}
        />
      )}
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
