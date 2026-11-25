import { listMovements } from "@/features/inventory/internal/movement/service";
import type { MovementMonth } from "@/features/inventory/internal/movement/types";
import { Text } from "@/features/shared/components";
import { formatMonthES, monthRange } from "@/features/shared/format/dates";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { loadAllPages } from "@/features/shared/hooks/useInfiniteList";
import { colors, useTone } from "@/features/shared/theme";
import { useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import type { MovementFilters } from "./FilterPanel";
import MovementRow from "./MovementRow";

const loadMonth = (month: string, filters: MovementFilters) =>
  loadAllPages((offset, limit) =>
    listMovements({
      ...filters,
      ...monthRange(month),
      sortBy: "createdAt",
      sortDir: "desc",
      limit,
      offset,
    }),
  );

type Props = {
  month: MovementMonth;
  filters: MovementFilters;
};

export default function MovementMonthRow({ month, filters }: Props) {
  const t = useTone();
  const { data: movements } = useFocusData(
    useCallback(() => loadMonth(month.month, filters), [month, filters]),
  );

  return (
    <View className="gap-3">
      <View className="px-1 py-1">
        <Text variant="item">{formatMonthES(month.month)}</Text>
      </View>
      {!movements && <ActivityIndicator color={colors[t.icon]} />}
      {movements?.map((m) => (
        <MovementRow key={m.id} movement={m} />
      ))}
    </View>
  );
}
