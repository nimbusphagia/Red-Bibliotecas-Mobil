import type { VisitorSort } from "@/features/loans/internal/visitor/schemas";
import { listVisitors } from "@/features/loans/internal/visitor/service";
import type {
  VisitorListItem,
  VisitorRole,
} from "@/features/loans/internal/visitor/types";
import {
  Button,
  InlineFilter,
  ItemList,
  InlineSort,
  type SortOption,
} from "@/features/shared/components";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { colors } from "@/features/shared/theme";
import type { SortDirection } from "@/features/shared/types/types";
import { UserPlus } from "lucide-react-native";
import { useCallback, useState } from "react";
import ListHeader from "./ListHeader";
import VisitorDialog from "./visitors/form/VisitorDialog";
import VisitorRow from "./visitors/list/VisitorRow";

const PAGE_SIZE = 20;

type Filter = "all" | VisitorRole;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "student", label: "Estudiantes" },
  { value: "teacher", label: "Profesores" },
];

const SORTS: SortOption<VisitorSort>[] = [
  { key: "name", label: "Nombre", defaultDir: "asc" },
  { key: "createdAt", label: "Fecha de registro", defaultDir: "desc" },
];

export default function VisitorList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<{ by: VisitorSort; dir: SortDirection }>({
    by: "name",
    dir: "asc",
  });
  const [dialog, setDialog] = useState<{ visitor?: VisitorListItem } | null>(
    null,
  );

  const debouncedSearch = useDebounce(search);

  const fetchPage = useCallback(
    (offset: number) =>
      listVisitors({
        search: debouncedSearch,
        role: filter === "all" ? undefined : filter,
        active: true,
        sortBy: sort.by,
        sortDir: sort.dir,
        limit: PAGE_SIZE,
        offset,
      }),
    [debouncedSearch, filter, sort],
  );

  const list = useInfiniteList(fetchPage);

  return (
    <>
      <ListHeader
        title="Visitantes"
        create={
          <Button
            variant="highlight"
            title="Nuevo"
            icon={<UserPlus size={18} color={colors.bg} />}
            onPress={() => setDialog({})}
          />
        }
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre..."
      />
      <ItemList
        toolbar={
          <>
            <InlineFilter
              options={FILTERS}
              value={filter}
              onChange={setFilter}
            />
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
        renderItem={(visitor) => (
          <VisitorRow visitor={visitor} onEdit={() => setDialog({ visitor })} />
        )}
      />
      {dialog && (
        <VisitorDialog
          visitor={dialog.visitor}
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
