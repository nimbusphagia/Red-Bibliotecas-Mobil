import type { CopySort } from "@/features/inventory/internal/copy/schemas";
import { listCopies } from "@/features/inventory/internal/copy/service";
import {
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import type { SortDirection } from "@/features/shared/types/types";
import { useCallback, useState } from "react";
import LabelRow from "./labels/list/LabelRow";
import { View } from "react-native";
import ShelfFilter from "./labels/list/ShelfFilter";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "labeled" | "pending";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "labeled", label: "Etiquetados" },
  { value: "pending", label: "Sin etiquetar" },
];

const SORTS: SortOption<CopySort>[] = [
  { key: "labeledAt", label: "Fecha de etiquetado", defaultDir: "desc" },
  { key: "createdAt", label: "Fecha de creación", defaultDir: "desc" },
];

export default function LabelList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [shelfId, setShelfId] = useState<number>();
  const [sort, setSort] = useState<{ by: CopySort; dir: SortDirection }>({
    by: "labeledAt",
    dir: "desc",
  });

  const debouncedSearch = useDebounce(search);

  const fetchPage = useCallback(
    (offset: number) =>
      listCopies({
        search: debouncedSearch,
        labeled: filter === "all" ? undefined : filter === "labeled",
        excludeReleased: true,
        shelfId,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [debouncedSearch, filter, shelfId, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <PageHeader
        title="Ejemplares"
        subtitle="Consulta el estado de las copias físicas"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Buscar por título o tejuelo...",
        }}
      />
      <ItemList
        toolbar={
          <>
            <View className="flex-row items-center gap-4">
              <ShelfFilter value={shelfId} onChange={setShelfId} withIcon />
              <InlineFilter
                options={FILTERS}
                value={filter}
                onChange={setFilter}
              />
            </View>
            <InlineSort
              options={SORTS}
              sortBy={sort.by}
              sortDir={sort.dir}
              onChange={(by, dir) => setSort({ by, dir })}
            />
          </>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(copy) => <LabelRow copy={copy} />}
      />
    </>
  );
}
