import { listMovements } from "@/features/inventory/internal/movement/service";
import type { MovementMonth } from "@/features/inventory/internal/movement/types";
import { CollapsibleList, Text } from "@/features/shared/components";
import { formatMonthES, monthRange } from "@/features/shared/format/dates";
import { loadAllPages } from "@/features/shared/hooks/useInfiniteList";
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
      defaultOpen={defaultOpen}
      reloadKey={month}
      load={() => loadMonth(month.month, filters)}
      renderItem={(m) => <MovementRow movement={m} />}
      header={<Text variant="item">{formatMonthES(month.month)}</Text>}
    />
  );
}
