import type { BookListItem } from "@/features/catalog/internal/book/types";
import { listCopies } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { writersOf } from "@/features/loans/ui/options";
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
    listCopies({
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
    <Surface inset className="items-center gap-3 px-4 py-3">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-4"
      >
        <View className="flex-1">
          <Text variant="item">{book.title}</Text>
          <View className="flex-row items-center">
            <Text variant="caption">
              {writersOf(book)}
            </Text>
            <Icon icon={Dot} />
            <Text variant="caption">
              {book.activeCount}
            </Text>
          </View>
        </View>
        <Icon icon={Chevron} />
      </Pressable>

      {open && !copies && <ActivityIndicator />}
      {open && copies?.length === 0 && (
        <Text variant="caption">
          {shelfId === undefined
            ? "Sin ejemplares"
            : "Sin ejemplares en esta estantería"}
        </Text>
      )}
      {open && !!copies?.length && (
        <ChipGroup center>
          {copies.map((c) => (
            <Chip
              key={c.id}
              label={`#${c.id}`}
              detail={c.status === "on_loan" ? "Prestado" : undefined}
              selected={selected.some((s) => s.id === c.id)}
              onPress={() => onToggle(toMoveCopy(c))}
            />
          ))}
        </ChipGroup>
      )}
    </Surface>
  );
}
