import type { BookListItem } from "@/features/catalog/internal/book/types";
import { fullName } from "@/features/catalog/ui/options";
import { listCopiesByBook } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  PillRow,
  PillRowColumn,
  Text,
  type Option,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { ChevronDown, ChevronUp, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { copyOption } from "../options";

type Props = {
  book: BookListItem;
  selected: Option[];
  onAdd: (option: Option) => void;
};

export default function PickerBook({ book, selected, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [copies, setCopies] = useState<CopyItem[]>();

  useEffect(() => {
    if (!open || copies) return;
    listCopiesByBook({
      bookId: book.id,
      excludeReleased: true,
      limit: 100,
    }).then((p) => setCopies(p.items));
  }, [open, copies, book.id]);

  const writers = book.collaborators
    .filter((c) => c.role === "writer")
    .map(fullName);
  const subtitle = [...new Set(writers), `${book.availableCount} disponibles`]
    .filter(Boolean)
    .join(" · ");
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View className="gap-3 rounded-[30px] border border-fg1 bg-fg2 px-5 py-3">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-4"
      >
        <View className="flex-1">
          <Text variant="h3" className="text-highlight">
            {book.title}
          </Text>
          <Text variant="subtitle">{subtitle}</Text>
        </View>
        <Chevron size={18} color={colors.primary} />
      </Pressable>

      {open && !copies && <ActivityIndicator />}
      {open && copies?.length === 0 && (
        <Text variant="subtitle">Sin ejemplares</Text>
      )}
      {open &&
        copies?.map((c) => {
          const lendable = c.status === "available" || c.status === "damaged";
          const added = selected.some((o) => o.id === c.id);
          return (
            <PillRow key={c.id} className="items-center bg-bg py-2">
              <PillRowColumn
                variant="highlight"
                title={c.labelText ?? `#${c.id}`}
              />
              <PillRowColumn title={`ID ${c.id}`} />
              <PillRowColumn title={COPY_STATUS_ES[c.status]} />
              <Button
                disabled={!lendable || added}
                icon={<Plus size={18} color={colors.bg} />}
                onPress={() =>
                  onAdd(copyOption(c.id, c.labelText, c.bookTitle))
                }
              />
            </PillRow>
          );
        })}
    </View>
  );
}
