import type { BookListItem } from "@/features/catalog/internal/book/types";
import { listCopiesByBook } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Chip,
  ChipGroup,
  Icon,
  Surface,
  Text,
} from "@/features/shared/components";
import { ChevronDown, ChevronUp, Dot } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { toLoanCopy, writersOf, type LoanCopy } from "../../options";

const lendable = (c: CopyItem) =>
  c.status === "available" || c.status === "damaged";

type Props = {
  book: BookListItem;
  shelfId?: number;
  selected: LoanCopy[];
  onToggle: (copy: LoanCopy) => void;
  defaultOpen?: boolean;
};

export default function PickerBook({
  book,
  shelfId,
  selected,
  onToggle,
  defaultOpen,
}: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [copies, setCopies] = useState<CopyItem[]>();

  useEffect(() => {
    if (!open) return;
    let stale = false;
    setCopies(undefined);
    listCopiesByBook({
      bookId: book.id,
      shelfId,
      excludeReleased: true,
      limit: 100,
    }).then((p) => {
      if (!stale) setCopies(p.items.filter(lendable));
    });
    return () => {
      stale = true;
    };
  }, [open, book.id, shelfId]);

  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <Surface row className="items-center gap-3 px-4 py-3">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-4"
      >
        <View className="flex-1">
          <Text variant="item">{book.title}</Text>
          <View className="flex-row items-center">
            <Text variant="caption">{writersOf(book)}</Text>
            <Icon icon={Dot} />
            <Text variant="caption">{book.availableCount}</Text>
          </View>
        </View>
        <View className="rounded-full size-6 bg-bg/25 items-center justify-center">
          <Icon icon={Chevron} tone="darkSolid" />
        </View>
      </Pressable>

      {open && !copies && <ActivityIndicator />}
      {open && copies?.length === 0 && (
        <Text variant="caption">Sin ejemplares disponibles</Text>
      )}
      {open && !!copies?.length && (
        <ChipGroup center>
          {copies.map((c) => (
            <Chip
              key={c.id}
              label={`#${c.id}`}
              detail={undefined}
              selected={selected.some((s) => s.id === c.id)}
              onPress={() => onToggle(toLoanCopy(c.id, c.labelText, book))}
            />
          ))}
        </ChipGroup>
      )}
    </Surface>
  );
}
