import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Chip,
  ChipGroup,
  Icon,
  Surface,
  Text,
} from "@/features/shared/components";
import { writersOf } from "@/features/catalog/ui/options";
import { ChevronDown, ChevronUp, Dot } from "lucide-react-native";
import { useEffect, useEffectEvent, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

export type BookCopiesRowProps<T extends { id: number }> = {
  book: BookListItem;
  selected: T[];
  onToggle: (item: T) => void;
  /** Ejemplares que se muestran como chips al abrir el libro. */
  loadCopies: (book: BookListItem) => Promise<CopyItem[]>;
  /** Cambia cuando los chips deben volver a cargarse (filtros, por ejemplo). */
  reloadKey?: string;
  /** Lo que se guarda en la selección al tocar un chip. */
  toItem: (copy: CopyItem, book: BookListItem) => T;
  chipDetail?: (copy: CopyItem) => string | undefined;
  /** Texto junto a los escritores (cantidad de ejemplares, por ejemplo). */
  subtitle?: string;
  emptyText?: string;
  defaultOpen?: boolean;
};

/**
 * Un libro con sus ejemplares agrupados: se abre y se elige por #id. Es la fila
 * común de los selectores de ejemplares.
 */
export default function BookCopiesRow<T extends { id: number }>({
  book,
  selected,
  onToggle,
  loadCopies,
  reloadKey,
  toItem,
  chipDetail,
  subtitle,
  emptyText = "Sin ejemplares",
  defaultOpen,
}: BookCopiesRowProps<T>) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [copies, setCopies] = useState<CopyItem[]>();
  const load = useEffectEvent(loadCopies);

  useEffect(() => {
    if (!open) return;
    let stale = false;
    setCopies(undefined);
    load(book).then((items) => {
      if (!stale) setCopies(items);
    });
    return () => {
      stale = true;
    };
  }, [open, book, reloadKey]);

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
            {subtitle && (
              <>
                <Icon icon={Dot} />
                <Text variant="caption">{subtitle}</Text>
              </>
            )}
          </View>
        </View>
        <View className="size-6 items-center justify-center rounded-full bg-bg/25">
          <Icon icon={Chevron} tone="darkSolid" />
        </View>
      </Pressable>

      {open && !copies && <ActivityIndicator />}
      {open && copies?.length === 0 && (
        <Text variant="caption">{emptyText}</Text>
      )}
      {open && !!copies?.length && (
        <ChipGroup center>
          {copies.map((c) => (
            <Chip
              key={c.id}
              label={`#${c.id}`}
              detail={chipDetail?.(c)}
              selected={selected.some((s) => s.id === c.id)}
              onPress={() => onToggle(toItem(c, book))}
            />
          ))}
        </ChipGroup>
      )}
    </Surface>
  );
}
