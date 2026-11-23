import type { MovementSort } from "@/features/inventory/internal/movement/schemas";
import { listMovements } from "@/features/inventory/internal/movement/service";
import type { MovementType } from "@/features/inventory/internal/movement/types";
import {
  ActiveCounter,
  Button,
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import { PAGE_SIZE, useSort } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { SlidersHorizontal } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import FilterPanel, {
  type MovementFilters,
} from "./movements/list/FilterPanel";
import MovementRow from "./movements/list/MovementRow";

type TypeFilter = "all" | MovementType;

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "entry", label: "Entradas" },
  { value: "exit", label: "Salidas" },
];

const SORTS: SortOption<MovementSort>[] = [
  { key: "createdAt", label: "Fecha", defaultDir: "desc" },
  { key: "copyCount", label: "Ejemplares", defaultDir: "desc" },
];

export default function MovementList() {
  const [filters, setFilters] = useState<MovementFilters>({});
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useSort<MovementSort>({ by: "createdAt", dir: "desc" });

  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined,
  ).length;

  const fetchPage = useCallback(
    (offset: number) =>
      listMovements({
        ...filters,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [filters, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <PageHeader
        title="Historial de movimientos"
        subtitle="Entradas y salidas de ejemplares del inventario"
      />
      <ItemList
        toolbar={
          <>
            <View className="shrink flex-row items-center gap-4">
              <View>
                <Button
                  variant="solid"
                  weight="lg"
                  size="sm"
                  iconTone="accent"
                  icon={SlidersHorizontal}
                  onPress={() => setOpen(true)}
                />
                {activeCount > 0 && <ActiveCounter count={activeCount} />}
              </View>
              <InlineFilter
                options={TYPE_FILTERS}
                value={filters.type ?? "all"}
                onChange={(v) =>
                  setFilters({ ...filters, type: v === "all" ? undefined : v })
                }
              />
            </View>
            <InlineSort
              options={SORTS}
              sortBy={sort.by}
              sortDir={sort.dir}
              onChange={setSort}
            />
          </>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(movement) => <MovementRow movement={movement} />}
      />
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
