import {
  getCopy,
  listCopies,
} from "@/features/inventory/internal/copy/service";
import {
  RELEASED_STATUSES,
  type CopyItem,
} from "@/features/inventory/internal/copy/types";
import {
  Column,
  Icon,
  InlineFilter,
  ItemList,
  Searchbar,
  StatusBadge,
  Surface,
} from "@/features/shared/components";
import { LABEL_STATE_ES, shelfLabel } from "@/features/shared/format/translate";
import { useDebounce } from "@/features/shared/hooks/useDebounce";
import { useInfiniteList } from "@/features/shared/hooks/useInfiniteList";
import { cn } from "@/features/shared/theme";
import { Check } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { BADGE_VARIANT, labelStateOf } from "../labelState";
import ShelfFilter from "../list/ShelfFilter";

const PAGE_SIZE = 10;

type StateFilter = "pending" | "outdated";

const FILTERS: { value: StateFilter; label: string }[] = [
  { value: "pending", label: "Sin etiquetar" },
  { value: "outdated", label: "Desactualizados" },
];

type Props = {
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  className?: string;
};

export default function LabelCopyPicker({
  selected,
  onToggle,
  className,
}: Props) {
  const [search, setSearch] = useState("");
  const [idText, setIdText] = useState("");
  const [state, setState] = useState<StateFilter>("pending");
  const [shelfId, setShelfId] = useState<number>();
  const debouncedSearch = useDebounce(search);
  const copyId = useDebounce(idText);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (copyId) {
        // Por número de ejemplar: se muestra aunque ya esté etiquetado.
        const found = await getCopy(Number(copyId)).catch(() => null);
        const items =
          found && !RELEASED_STATUSES.some((r) => r === found.status)
            ? [found]
            : [];
        return { items, total: items.length, limit: PAGE_SIZE, offset };
      }
      return listCopies({
        search: debouncedSearch,
        labeled: state === "pending" ? false : undefined,
        outdated: state === "outdated" ? true : undefined,
        excludeReleased: true,
        shelfId,
        limit: PAGE_SIZE,
        offset,
      });
    },
    [debouncedSearch, copyId, state, shelfId],
  );
  const list = useInfiniteList(fetchPage);

  return (
    <View className={cn("gap-3", className)}>
      <View className="h-12 flex-row items-center gap-3">
        <Searchbar
          className="w-auto flex-1"
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por título o tejuelo..."
        />
        <Searchbar
          className="w-28"
          value={idText}
          onChangeText={(t) => setIdText(t.replace(/\D/g, ""))}
          placeholder="#ID"
        />
      </View>
      <ItemList
        gap
        toolbarSurface={false}
        tone="light"
        toolbar={
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center gap-4">
              <ShelfFilter value={shelfId} onChange={setShelfId} />
              <InlineFilter
                options={FILTERS}
                value={state}
                onChange={setState}
              />
            </View>
          </ScrollView>
        }
        items={list.items}
        loading={list.loading}
        onEndReached={list.loadMore}
        renderItem={(c) => (
          <PickRow
            copy={c}
            selected={selected.some((s) => s.id === c.id)}
            onPress={() => onToggle(c)}
          />
        )}
      />
    </View>
  );
}

function PickRow({
  copy,
  selected,
  onPress,
}: {
  copy: CopyItem;
  selected: boolean;
  onPress: () => void;
}) {
  const state = labelStateOf(copy);
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Surface
        inset={selected}
        row={!selected}
        className="flex-row items-center gap-4 px-4 py-3"
      >
        <View className="size-6 items-center justify-center">
          {selected && <Icon icon={Check} />}
        </View>
        <Column variant="id" text={`#${copy.id}`} />
        <Column
          variant="subtitled"
          text={copy.bookTitle}
          subtitle1={copy.labelText ?? undefined}
          subtitle2={copy.authors ?? undefined}
        />
        <Column
          expand={false}
          text={shelfLabel({
            name: copy.shelfName,
            isDefault: copy.shelfIsDefault,
          })}
        />
        <StatusBadge
          text={LABEL_STATE_ES[state]}
          variant={BADGE_VARIANT[state]}
        />
      </Surface>
    </Pressable>
  );
}
