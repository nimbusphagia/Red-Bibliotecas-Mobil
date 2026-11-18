import type { MovementSort } from "@/features/inventory/internal/movement/schemas";
import { listMovements } from "@/features/inventory/internal/movement/service";
import type { MovementType } from "@/features/inventory/internal/movement/types";
import {
  Button,
  InlineFilter,
  InlineSort,
  ItemList,
  PageHeader,
  type SortOption,
} from "@/features/shared/components";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { colors } from "@/features/shared/theme";
import type { SortDirection } from "@/features/shared/types/types";
import { Circle, SlidersHorizontal } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import FilterPanel, {
  type MovementFilters,
} from "./movements/list/FilterPanel";
import MovementRow from "./movements/list/MovementRow";

const PAGE_SIZE = 20;

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
  const [sort, setSort] = useState<{ by: MovementSort; dir: SortDirection }>({
    by: "createdAt",
    dir: "desc",
  });

  const active = Object.values(filters).some((v) => v !== undefined);

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
      <PageHeader title="Inventario" />
      <ItemList
        toolbar={
          <>
            <View className="shrink flex-row items-center gap-2">
              <View>
                <Button
                  variant="secondary"
                  icon={<SlidersHorizontal size={18} color={colors.primary} />}
                  onPress={() => setOpen(true)}
                />
                {active && (
                  <View
                    className="absolute right-0 top-0"
                    style={{ pointerEvents: "none" }}
                  >
                    <Circle
                      size={10}
                      color={colors.highlight}
                      fill={colors.highlight}
                    />
                  </View>
                )}
              </View>
              <InlineFilter
                options={TYPE_FILTERS}
                value={filters.type ?? "all"}
                onChange={(v) =>
                  setFilters({ ...filters, type: v === "all" ? undefined : v })
                }
              />
            </View>
            <View className="flex-row items-center gap-4">
              <View className="w-px self-stretch bg-fg1" />
              <InlineSort
                options={SORTS}
                sortBy={sort.by}
                sortDir={sort.dir}
                onChange={(by, dir) => setSort({ by, dir })}
              />
            </View>
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
