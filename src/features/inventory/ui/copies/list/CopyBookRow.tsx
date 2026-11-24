import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyBook } from "@/features/inventory/internal/copy/types";
import type { CopyListParams } from "@/features/inventory/internal/copy/schemas";
import { CollapsibleList, Icon, Text } from "@/features/shared/components";
import { loadAllPages } from "@/features/shared/hooks/useInfiniteList";
import { View } from "react-native";
import { LABEL_STATE_ICON, type LabelState } from "../../labels/labelState";
import CopyRow from "./CopyRow";

const loadCopies = (bookId: number, filters: CopyListParams) =>
  loadAllPages((offset, limit) =>
    listCopies({
      ...filters,
      bookId,
      excludeReleased: true,
      sortBy: "copyNumber",
      sortDir: "asc",
      limit,
      offset,
    }),
  );

const COUNTS: LabelState[] = ["labeled", "pending", "outdated"];

type Props = {
  book: CopyBook;
  /** Los mismos filtros de la lista, para mostrar solo los ejemplares que cumplen. */
  filters: CopyListParams;
  defaultOpen?: boolean;
};

export default function CopyBookRow({ book, filters, defaultOpen }: Props) {
  const total = book.labeled + book.pending + book.outdated;
  const subtitle = [book.authors, book.publisherName]
    .filter(Boolean)
    .join(" · ");

  return (
    <CollapsibleList
      groupId={book.id}
      defaultOpen={defaultOpen}
      reloadKey={book}
      load={() => loadCopies(book.id, filters)}
      renderItem={(c) => <CopyRow copy={c} />}
      header={
        <View className="flex-row items-center justify-between gap-4">
          <View className="shrink gap-1">
            <View className="flex-row items-center gap-2">
              <Text variant="item" className="shrink" numberOfLines={1}>
                {book.title}
              </Text>
              <Text variant="caption">({total})</Text>
            </View>
            {!!subtitle && (
              <Text variant="caption" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-3">
            {COUNTS.map((state) => (
              <View key={state} className="flex-row items-center gap-1">
                <Icon icon={LABEL_STATE_ICON[state]} size="sm" />
                <Text variant="caption">{book[state]}</Text>
              </View>
            ))}
          </View>
        </View>
      }
    />
  );
}
