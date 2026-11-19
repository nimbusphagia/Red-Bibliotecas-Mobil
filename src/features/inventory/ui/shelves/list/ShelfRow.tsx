import type { ShelfListItem } from "@/features/inventory/internal/shelf/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Eye, Pencil } from "lucide-react-native";

type Props = { shelf: ShelfListItem; onEdit: () => void };

export default function ShelfRow({ shelf, onEdit }: Props) {
  return (
    <PillRow>
      <Column variant="id" text={`#${shelf.id}`} />
      <Column
        variant="subtitled"
        text={shelfLabel(shelf)}
        subtitle1={shelf.description ?? undefined}
      />
      <Column
        variant="subtitled"
        text={String(shelf.copyCount)}
        subtitle1={`Ejemplar${shelf.copyCount === 1 ? "" : "es"}`}
        expand={false}
        containerClass="w-[100]"
      />
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[104] justify-end"
      >
        {!shelf.isDefault && (
          <Button
            variant="secondary"
            icon={<Pencil size={16} color={colors.highlight} strokeWidth={2} />}
            onPress={onEdit}
          />
        )}
        <Link href={`/shelves/${shelf.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={16} color={colors.highlight} strokeWidth={2} />}
          />
        </Link>
      </Column>
    </PillRow>
  );
}
