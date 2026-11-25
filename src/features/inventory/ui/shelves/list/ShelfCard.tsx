import type { ShelfListItem } from "@/features/inventory/internal/shelf/types";
import { ItemCard } from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";

type Props = { shelf: ShelfListItem };

export default function ShelfCard({ shelf }: Props) {
  return (
    <ItemCard
      title={shelfLabel(shelf)}
      subtitle={shelf.description}
      lead={`${shelf.copyCount} libro${shelf.copyCount === 1 ? "" : "s"}`}
      href={`/shelves/${shelf.id}`}
      chips={shelf.isDefault ? [{ label: "Predeterminada" }] : undefined}
    />
  );
}
