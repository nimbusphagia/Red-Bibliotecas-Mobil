import type { CopySort } from "@/features/inventory/internal/copy/schemas";
import { listCopies } from "@/features/inventory/internal/copy/service";
import {
  Button,
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
import { Link } from "expo-router";
import { Tag } from "lucide-react-native";
import { View } from "react-native";
import ShelfFilter from "./labels/list/ShelfFilter";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "labeled" | "pending" | "outdated";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "labeled", label: "Etiquetados" },
  { value: "pending", label: "Sin etiquetar" },
  { value: "outdated", label: "Desactualizados" },
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
        labeled:
          filter === "labeled" ? true : filter === "pending" ? false : undefined,
        outdated: filter === "outdated" ? true : undefined,
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
        subtitle="Controla qué ejemplares ya tienen su tejuelo"
        lead={
          <Link href="/labels/mark" asChild>
            <Button title="Etiquetar" icon={Tag} size="sm" weight="md" />
          </Link>
        }
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
