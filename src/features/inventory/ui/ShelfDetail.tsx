import { useSession } from "@/features/account/internal/session";
import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopySummary } from "@/features/inventory/internal/copy/types";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";
import {
  getShelf,
  getShelfSummary,
} from "@/features/inventory/internal/shelf/service";
import type { Shelf } from "@/features/inventory/internal/shelf/types";
import {
  Button,
  DetailColumns,
  ItemList,
  PageHeader,
  Panel,
  Searchbar,
  type DetailRow,
} from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { cn } from "@/features/shared/theme";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { PAGE_SIZE, useSearch } from "@/features/shared/hooks/useListControls";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { routeIdSchema } from "@/features/shared/types/schemas";
import { useCallback, useState } from "react";
import { PencilLine } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import CopyRow from "./copies/list/CopyRow";
import ShelfDialog from "./shelves/form/ShelfDialog";

type Data = { shelf: Shelf; summary: CopySummary };

const countRow = (label: string, n: number): DetailRow => ({
  label,
  content: String(n),
  muted: n === 0,
});

export default function ShelfDetail({ id }: { id: string }) {
  const shelfId = routeIdSchema.parse(id);
  const [editing, setEditing] = useState(false);
  const { search, setSearch, debouncedSearch } = useSearch();
  const [idText, setIdText] = useState("");
  const copyId = useDebounce(idText);
  const { isExpanded } = useLayoutMode();
  const session = useSession();
  const actorId =
    session.status === "signed-in" && canManageStock(session.account.role)
      ? session.account.id
      : null;

  const { data, reload } = useFocusData(
    useCallback(async (): Promise<Data> => {
      const [shelf, summary] = await Promise.all([
        getShelf(shelfId),
        getShelfSummary(shelfId),
      ]);
      return { shelf, summary };
    }, [shelfId]),
  );

  const fetchPage = useCallback(
    (offset: number) =>
      listCopies({
        shelfId,
        excludeReleased: true,
        search: debouncedSearch,
        copyId: copyId ? Number(copyId) : undefined,
        sortBy: "title",
        limit: PAGE_SIZE,
        offset,
      }),
    [shelfId, debouncedSearch, copyId],
  );

  const list = useInfiniteList(fetchPage);

  if (!data) return <ActivityIndicator />;

  const { shelf, summary } = data;

  const summaryRows: DetailRow[] = [
    countRow("Total", summary.total),
    countRow("Prestados", summary.onLoan),
    countRow("Deteriorados", summary.damaged),
    countRow("Etiquetados", summary.labeled),
    countRow("Sin etiquetar", summary.pending),
    {
      ...countRow("Desactualizados", summary.outdated),
      accent: summary.outdated > 0 ? "neg" : undefined,
    },
  ];

  return (
    <>
      <PageHeader
        title={shelfLabel(shelf)}
        subtitle={shelf.description ?? undefined}
        lead={
          !shelf.isDefault && (
            <Button
              title="Editar"
              icon={PencilLine}
              size="sm"
              weight="md"
              onPress={() => setEditing(true)}
            />
          )
        }
      />
      <ScreenBody onEndReached={list.loadMore}>
        <DetailColumns
          columns={[
            { title: "Resumen", rows: summaryRows, columns: 2, fixed: true },
          ]}
        />
        <Panel
          title="Ejemplares"
          className="pt-7"
          lead={
            <View className="h-11 flex-1 flex-row justify-end gap-3">
              <Searchbar
                className={cn("flex-1", !isExpanded && "max-w-[300px]")}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por título o tejuelo..."
              />
              {isExpanded && (
                <Searchbar
                  className="w-28"
                  value={idText}
                  onChangeText={(t) => setIdText(t.replace(/\D/g, ""))}
                  placeholder="#ID"
                />
              )}
            </View>
          }
        >
          <ItemList
            inline
            items={list.items}
            loading={list.loading}
            error={list.error}
            renderItem={(copy) => (
              <CopyRow
                copy={copy}
                actorId={actorId}
                showBook
                onChanged={() => {
                  list.reload();
                  reload();
                }}
              />
            )}
          />
        </Panel>
      </ScreenBody>
      {editing && (
        <ShelfDialog
          shelf={shelf}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            reload();
          }}
        />
      )}
    </>
  );
}
