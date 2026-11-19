import type { BookListItem } from "@/features/catalog/internal/book/types";
import { listCopiesByBook } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { writersOf } from "@/features/loans/ui/options";
import { Chip, Text } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { ChevronDown, ChevronUp, Dot } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { toMoveCopy, type MoveCopy } from "../options";

type Props = {
  book: BookListItem;
  shelfId?: number;
  selected: MoveCopy[];
  onToggle: (copy: MoveCopy) => void;
  defaultOpen?: boolean;
};

export default function MovePickerBook({
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
      if (!stale) setCopies(p.items);
    });
    return () => {
      stale = true;
    };
  }, [open, book.id, shelfId]);

  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View className="gap-3 rounded-lg border border-fg1 bg-fg2 px-5 py-3 items-center">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-4"
      >
        <View className="flex-1">
          <Text variant="h3">{book.title}</Text>
          <View className="flex-row items-center">
            <Text variant="subtitle" className="text-primary">
              {writersOf(book)}
            </Text>
            <Dot size={16} color={colors.primary} />
            <Text variant="subtitle" className="text-primary">
              {book.activeCount}
            </Text>
          </View>
        </View>
        <Chevron size={18} color={colors.secondary} strokeWidth={3} />
      </Pressable>

      {open && !copies && <ActivityIndicator />}
      {open && copies?.length === 0 && (
        <Text variant="subtitle">
          {shelfId === undefined
            ? "Sin ejemplares"
            : "Sin ejemplares en esta estantería"}
        </Text>
      )}
      {open && !!copies?.length && (
        <View className="flex-row flex-wrap gap-2 gap-y-4 justify-center">
          {copies.map((c) => (
            <Chip
              key={c.id}
              label={`#${c.id}`}
              detail={c.status === "on_loan" ? "Prestado" : undefined}
              selected={selected.some((s) => s.id === c.id)}
              onPress={() => onToggle(toMoveCopy(c))}
            />
          ))}
        </View>
      )}
    </View>
  );
}
