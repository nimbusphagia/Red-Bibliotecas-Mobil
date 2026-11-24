import { listCopies } from "@/features/inventory/internal/copy/service";
import type {
  CopyBook,
  CopyItem,
} from "@/features/inventory/internal/copy/types";
import type { CopyListParams } from "@/features/inventory/internal/copy/schemas";
import { CollapsibleList, Icon, Text } from "@/features/shared/components";
import { View } from "react-native";
import { LABEL_STATE_ICON, type LabelState } from "../../labels/labelState";
import CopyRow from "./CopyRow";

const PAGE = 100;

async function loadCopies(bookId: number, filters: CopyListParams) {
  const items: CopyItem[] = [];
  for (;;) {
    const page = await listCopies({
      ...filters,
      bookId,
      excludeReleased: true,
      sortBy: "copyNumber",
      sortDir: "asc",
      limit: PAGE,
      offset: items.length,
    });
    items.push(...page.items);
    if (!page.items.length || items.length >= page.total) return items;
  }
}

const COUNTS: LabelState[] = ["labeled", "pending", "outdated"];

type Props = {
  book: CopyBook;
  /** Los mismos filtros de la lista, para mostrar solo los ejemplares que cumplen. */
  filters: CopyListParams;
  defaultOpen?: boolean;
};

export default function CopyBookRow({ book, filters, defaultOpen }: Props) {
  const subtitle = [book.authors, book.publisherName]
    .filter(Boolean)
    .join(" · ");

  return (
    <CollapsibleList
      defaultOpen={defaultOpen}
      reloadKey={book}
      load={() => loadCopies(book.id, filters)}
      renderItem={(c) => <CopyRow copy={c} />}
      header={
        <View className="flex-row items-center justify-between gap-4">
          <View className="shrink gap-1">
            <Text variant="item" numberOfLines={1}>
              {book.title}
            </Text>
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
