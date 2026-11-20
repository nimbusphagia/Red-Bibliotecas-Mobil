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
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import type { SortDirection } from "@/features/shared/types/types";
import { useCallback, useState } from "react";
import ShelfDialog from "./shelves/form/ShelfDialog";
import ShelfRow from "./shelves/list/ShelfRow";
import { Link } from "expo-router";
import { ArrowRightLeft, SquarePlus } from "lucide-react-native";

const PAGE_SIZE = 20;

const SORTS: SortOption<ShelfSort>[] = [
  { key: "name", label: "Nombre", defaultDir: "asc" },
  { key: "copyCount", label: "Ejemplares", defaultDir: "desc" },
  { key: "createdAt", label: "Fecha de creación", defaultDir: "desc" },
];

export default function ShelfList() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ by: ShelfSort; dir: SortDirection }>({
    by: "name",
    dir: "asc",
  });
  const [dialog, setDialog] = useState<{ shelf?: ShelfListItem } | null>(null);

  const debouncedSearch = useDebounce(search);

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
        lead={
          <>
            <Button
              title="Nuevo"
              icon={SquarePlus}
              onPress={() => setDialog({})}
            />
            <Link href="/shelves/reorganize" asChild>
              <Button
                variant="secondary"
                title="Reorganizar"
                icon={ArrowRightLeft}
              />
            </Link>
          </>
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
            onChange={(by, dir) => setSort({ by, dir })}
          />
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
