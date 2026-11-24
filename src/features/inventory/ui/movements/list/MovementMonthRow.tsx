import { listMovements } from "@/features/inventory/internal/movement/service";
import type { MovementMonth } from "@/features/inventory/internal/movement/types";
import { CollapsibleList, Icon, Text } from "@/features/shared/components";
import { formatMonthES, monthRange } from "@/features/shared/format/dates";
import { loadAllPages } from "@/features/shared/hooks/useInfiniteList";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { View } from "react-native";
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
  defaultOpen?: boolean;
};

export default function MovementMonthRow({ month, filters, defaultOpen }: Props) {
  return (
    <CollapsibleList
      groupId={month.month}
      defaultOpen={defaultOpen}
      reloadKey={month}
      load={() => loadMonth(month.month, filters)}
      renderItem={(m) => <MovementRow movement={m} />}
      header={
        <View className="flex-row items-center justify-between gap-4">
          <Text variant="item">{formatMonthES(month.month)}</Text>
          <View className="flex-row items-center">
            <View className="mr-2 flex-row items-center gap-0.5">
              <Icon icon={ArrowUp} size="sm" />
              <Text variant="caption">{month.entries}</Text>
            </View>
            <View className="flex-row items-center gap-0.5">
              <Icon icon={ArrowDown} size="sm" />
              <Text variant="caption">{month.exits}</Text>
            </View>
          </View>
        </View>
      }
    />
  );
}
