import type { BookListItem } from "@/features/catalog/internal/book/types";
import { listCopiesByBook } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { Chip, ChipGroup, Icon, Text } from "@/features/shared/components";
import { ChevronDown, ChevronUp, Dot } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { toLoanCopy, writersOf, type LoanCopy } from "../../options";

const lendable = (c: CopyItem) =>
  c.status === "available" || c.status === "damaged";

type Props = {
  book: BookListItem;
  selected: LoanCopy[];
  onToggle: (copy: LoanCopy) => void;
  defaultOpen?: boolean;
};

export default function PickerBook({
  book,
  selected,
  onToggle,
  defaultOpen,
}: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [copies, setCopies] = useState<CopyItem[]>();

  useEffect(() => {
    if (!open || copies) return;
    listCopiesByBook({
      bookId: book.id,
      excludeReleased: true,
      limit: 100,
    }).then((p) => setCopies(p.items.filter(lendable)));
  }, [open, copies, book.id]);

  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View className="gap-3 rounded-lg border border-fg1 bg-fg2 px-4 py-3 items-center">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-4"
      >
        <View className="flex-1">
          <Text variant="item">{book.title}</Text>
          <View className="flex-row items-center">
            <Text variant="caption" className="text-primary">
              {writersOf(book)}
            </Text>
            <Icon icon={Dot} />
            <Text variant="caption" className="text-primary">
              {book.availableCount}
            </Text>
          </View>
        </View>
        <Icon icon={Chevron} tone="secondary" />
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
    </View>
  );
}
