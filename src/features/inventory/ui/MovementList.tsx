import type { MovementSort } from "@/features/inventory/internal/movement/schemas";
import { listMovementMonths } from "@/features/inventory/internal/movement/service";
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
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { useSort } from "@/features/shared/hooks/useListControls";
import { Link } from "expo-router";
import {
  PackageMinus,
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import FilterPanel, {
  type MovementFilters,
} from "./movements/list/FilterPanel";
import MovementMonthRow from "./movements/list/MovementMonthRow";
import { useCanManageStock } from "./useCanManageStock";

type TypeFilter = "all" | MovementType;

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "entry", label: "Entradas" },
  { value: "exit", label: "Salidas" },
];

const SORTS: SortOption<MovementSort>[] = [
  { key: "createdAt", label: "Fecha", defaultDir: "desc" },
];

export default function MovementList() {
  const [filters, setFilters] = useState<MovementFilters>({});
  const [open, setOpen] = useState(false);
  const canManage = useCanManageStock();
  const [sort, setSort] = useSort<MovementSort>({
    by: "createdAt",
    dir: "desc",
  });

  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined,
  ).length;

  const { data: months } = useFocusData(
    useCallback(
      () =>
        listMovementMonths({ ...filters, sortDir: sort.dir }).then((list) =>
          list.map((m) => ({ ...m, id: Number(m.month.replace("-", "")) })),
        ),
      [filters, sort.dir],
    ),
  );

  return (
    <>
      <PageHeader
        title="Historial de movimientos"
        subtitle="Entradas y salidas de ejemplares"
        lead={
          canManage && (
            <View className="flex-row items-center gap-2">
              <Link href="/stock/exit" asChild>
                <Button
                  title="Salida"
                  variant="soft"
                  icon={PackageMinus}
                  size="sm"
                  weight="md"
                />
              </Link>
              <Link href="/stock/entry" asChild>
                <Button
                  title="Entrada"
                  icon={PackagePlus}
                  size="sm"
                  weight="md"
                />
              </Link>
            </View>
          )
        }
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
        items={months ?? []}
        loading={!months}
        renderItem={(month) => (
          <MovementMonthRow month={month} filters={filters} />
        )}
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
