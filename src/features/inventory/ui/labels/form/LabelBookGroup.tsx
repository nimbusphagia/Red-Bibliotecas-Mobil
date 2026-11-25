import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyListParams } from "@/features/inventory/internal/copy/schemas";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { Column, Icon, ListRow, Text } from "@/features/shared/components";
import { LABEL_STATE_ES } from "@/features/shared/format/translate";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { loadAllPages } from "@/features/shared/hooks/useInfiniteList";
import { accents, cn, colors, useTone } from "@/features/shared/theme";
import { useCallback } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { LABEL_STATE_ICON, labelStateOf } from "../labelState";

export type BookHeader = {
  id: number;
  title: string;
  authors: string | null;
  publisherName: string | null;
};

type Props = {
  book: BookHeader;
  copies?: CopyItem[];
  selected: CopyItem[];
  onToggle: (copy: CopyItem) => void;
};

export default function LabelBookGroup({
  book,
  copies,
  selected,
  onToggle,
}: Props) {
  const t = useTone();
  const byline = [book.authors, book.publisherName].filter(Boolean).join(" · ");

  return (
    <View className="gap-3">
      <View className="px-1 py-1">
        <Text variant="item">{book.title}</Text>
        {byline ? <Text variant="caption">{byline}</Text> : null}
      </View>
      {!copies && <ActivityIndicator color={colors[t.icon]} />}
      {copies?.map((c) => {
        const state = labelStateOf(c);
        const isSelected = selected.some((s) => s.id === c.id);
        return (
          <Pressable
            key={c.id}
            onPress={() => onToggle(c)}
            className="active:opacity-80"
          >
            <ListRow className={cn(isSelected && accents.sm.box)}>
              <Column variant="id" text={`#${c.id}`} />
              <Column text={c.labelText ?? "---"} />
              <Column expand={false} containerClass="w-44 shrink-0 gap-2">
                <Icon icon={LABEL_STATE_ICON[state]} size="lg" stroke="sm" />
                <Text variant="itemSm">{LABEL_STATE_ES[state]}</Text>
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
export function RemoteLabelBookGroup({ match, ...props }: RemoteProps) {
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
  return <LabelBookGroup {...props} copies={data} />;
}
