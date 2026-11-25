import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyListParams } from "@/features/inventory/internal/copy/schemas";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { Column, Icon, ListRow, Text } from "@/features/shared/components";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { loadAllPages } from "@/features/shared/hooks/useInfiniteList";
import { accents, cn, colors, useTone } from "@/features/shared/theme";
import type { LucideIcon } from "lucide-react-native";
import { useCallback } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

export type BookHeader = {
  id: number;
  title: string;
  authors: string | null;
  publisherName: string | null;
};

export type CopyState = { icon: LucideIcon; text: string };

/** Las copias que cumplen `keep`, agrupadas por libro y ordenadas. */
export function groupCopies(
  copies: CopyItem[],
  keep: (c: CopyItem) => boolean,
) {
  const groups = new Map<number, BookHeader & { copies: CopyItem[] }>();
  for (const c of copies) {
    if (!keep(c)) continue;
    const group = groups.get(c.bookId) ?? {
      id: c.bookId,
      title: c.bookTitle,
      authors: c.authors,
      publisherName: c.publisherName,
      copies: [],
    };
    group.copies.push(c);
    groups.set(c.bookId, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((g) => ({ ...g, copies: g.copies.sort((a, b) => a.id - b.id) }));
}

type Props = {
  book: BookHeader;
  copies?: CopyItem[];
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
  stateOf: (copy: CopyItem) => CopyState;
  /** Ejemplares que se muestran pero no se pueden elegir. */
  disabled?: (copy: CopyItem) => boolean;
};

export default function CopyBookGroup({
  book,
  copies,
  selected,
  onToggle,
  stateOf,
  disabled,
}: Props) {
  const t = useTone();
  const byline = [book.authors, book.publisherName].filter(Boolean).join(" · ");

  return (
    <View className="gap-3">
      <View className="px-1 py-1">
        <Text variant="item" className="text-[14px]">
          {book.title}
        </Text>
        {byline ? <Text variant="caption">{byline}</Text> : null}
      </View>
      {!copies && <ActivityIndicator color={colors[t.icon]} />}
      {copies?.map((c) => {
        const state = stateOf(c);
        const isSelected = selected.some((s) => s.id === c.id);
        const isDisabled = !isSelected && !!disabled?.(c);
        return (
          <Pressable
            key={c.id}
            onPress={() => onToggle(c)}
            disabled={isDisabled}
            className={cn("active:opacity-80", isDisabled && "opacity-50")}
          >
            <ListRow className={cn(isSelected && accents.sm.box)}>
              <Column variant="id" text={`#${c.id}`} />
              <Column text={c.labelText ?? "---"} />
              <Column expand={false} containerClass="w-44 shrink-0 gap-2">
                <Icon icon={state.icon} size="lg" stroke="sm" />
                <Text variant="itemSm">{state.text}</Text>
              </Column>
            </ListRow>
          </Pressable>
        );
      })}
    </View>
  );
}

type RemoteProps = Omit<Props, "copies"> & {
  match: Omit<CopyListParams, "bookId">;
};

/** Grupo que trae los ejemplares del libro que cumplen `match`. */
export function RemoteCopyBookGroup({ match, ...props }: RemoteProps) {
  const bookId = props.book.id;
  const { data } = useFocusData(
    useCallback(
      () =>
        loadAllPages((offset, limit) =>
          listCopies({
            ...match,
            bookId,
            excludeReleased: true,
            sortBy: "copyNumber",
            limit,
            offset,
          }),
        ),
      [match, bookId],
    ),
  );
  return <CopyBookGroup {...props} copies={data} />;
}
