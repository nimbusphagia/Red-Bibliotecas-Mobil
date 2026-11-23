import type { ShelfListItem } from "@/features/inventory/internal/shelf/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye, PencilLine } from "lucide-react-native";

type Props = { shelf: ShelfListItem; onEdit: () => void };

export default function ShelfRow({ shelf, onEdit }: Props) {
  return (
    <ListRow>
      <Column
        variant="subtitled"
        text={shelfLabel(shelf)}
        subtitle1={shelf.description ?? undefined}
      />
      <Column
        variant="subtitled"
        text={String(shelf.copyCount)}
        subtitle1={`Ejemplar${shelf.copyCount === 1 ? "" : "es"}`}
        width="md"
      />
      <Column variant="actions" width="md">
        {!shelf.isDefault && (
          <Button variant="soft" icon={PencilLine} onPress={onEdit} />
        )}
        <Link href={`/shelves/${shelf.id}`} asChild>
          <Button variant="soft" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
