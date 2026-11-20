import type {
  MovementLine,
  MovementType,
} from "@/features/inventory/internal/movement/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";

type Props = { line: MovementLine; movementType: MovementType };

export default function MovementLineRow({ line, movementType }: Props) {
  const canOpenBook = movementType === "entry" && line.status === "available";

  return (
    <ListRow compact>
      <Column text={`#${line.copyId}`} variant="id" />
      <Column
        variant="subtitled"
        text={line.bookTitle}
        subtitle1={line.labelText ?? undefined}
      />
      <Column variant="actions">
        <StatusBadge text={COPY_STATUS_ES[line.status]} variant="active" />
      </Column>
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[48px] justify-end"
      >
        {canOpenBook && (
          <Link href={`/catalog/${line.bookId}`} asChild>
            <Button variant="secondary" icon={Eye} />
          </Link>
        )}
      </Column>
    </ListRow>
  );
}
