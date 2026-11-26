import type { ShelfSort } from "@/features/inventory/internal/shelf/schemas";
import { listShelves } from "@/features/inventory/internal/shelf/service";
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
import ShelfCard from "./shelves/list/ShelfCard";
import { useCanManageStock } from "./useCanManageStock";
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
  const [sort, setSort] = useSort<ShelfSort>({ by: "createdAt", dir: "desc" });
  const [adding, setAdding] = useState(false);
  const canManage = useCanManageStock();

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
          canManage && (
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
                onPress={() => setAdding(true)}
              />
            </View>
          )
        }
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por nombre...",
        }}
      />
      <ItemList
        toolbar={
          <InlineSort
            options={SORTS}
            sortBy={sort.by}
            sortDir={sort.dir}
            onChange={setSort}
          />
        }
        items={list.items}
        loading={list.loading}
        error={list.error}
        onEndReached={list.loadMore}
        columns={4}
        compactColumns={3}
        renderItem={(shelf) => <ShelfCard shelf={shelf} />}
      />
      {adding && (
        <ShelfDialog
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            list.reload();
          }}
        />
      )}
    </>
  );
}
