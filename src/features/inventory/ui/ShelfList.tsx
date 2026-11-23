import type { ShelfSort } from "@/features/inventory/internal/shelf/schemas";
import { listShelves } from "@/features/inventory/internal/shelf/service";
import type { ShelfListItem } from "@/features/inventory/internal/shelf/types";
import {
  Button,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import { PAGE_SIZE, useSearch, useSort } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useCallback, useState } from "react";
import ShelfDialog from "./shelves/form/ShelfDialog";
import ShelfRow from "./shelves/list/ShelfRow";
import { Link } from "expo-router";
import { Plus, SendToBack } from "lucide-react-native";
import { View } from "react-native";

const SORTS: SortOption<ShelfSort>[] = [
  { key: "name", label: "Nombre", defaultDir: "asc" },
  { key: "copyCount", label: "Cantidad", defaultDir: "desc" },
  { key: "createdAt", label: "Fecha de creación", defaultDir: "desc" },
];

export default function ShelfList() {
  const { search, setSearch, debouncedSearch } = useSearch();
  const [sort, setSort] = useSort<ShelfSort>({ by: "name", dir: "asc" });
  const [dialog, setDialog] = useState<{ shelf?: ShelfListItem } | null>(null);


  const fetchPage = useCallback(
    (offset: number) =>
      listShelves({
        search: debouncedSearch,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [debouncedSearch, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <PageHeader
        title="Estantería"
        subtitle="Organiza dónde se guarda cada ejemplar"
        lead={
          <View className="flex-row items-center gap-2">
            <Link href="/shelves/reorganize" asChild>
              <Button
                title="Organizar"
                icon={SendToBack}
                size="sm"
                weight="md"
              />
            </Link>
            <Button
              title="Nuevo"
              icon={Plus}
              size="sm"
              weight="md"
              onPress={() => setDialog({})}
            />
          </View>
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por nombre...",
        }}
      />
      <ItemList
        toolbar={
          <View className="items-end flex-1">
            <InlineSort
              options={SORTS}
              sortBy={sort.by}
              sortDir={sort.dir}
              onChange={setSort}
            />
          </View>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(shelf) => (
          <ShelfRow shelf={shelf} onEdit={() => setDialog({ shelf })} />
        )}
      />
      {dialog && (
        <ShelfDialog
          shelf={dialog.shelf}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            list.reload();
          }}
        />
      )}
    </>
  );
}
