import type {
  MovementLine,
  MovementType,
} from "@/features/inventory/internal/movement/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye } from "lucide-react-native";
import { COPY_STATUS_ICON } from "../../copies/statusIcon";

type Props = { line: MovementLine; movementType: MovementType };

export default function MovementLineRow({ line, movementType }: Props) {
  const canOpenBook = movementType === "entry" && line.status === "available";

  return (
    <ListRow>
      <Column variant="id" text={`#${line.copyId}`} />
      <Column
        variant="subtitled"
        text={line.bookTitle}
        subtitle1={line.authors ?? undefined}
      />
      <Column text={line.labelText ?? "---"} />
      <Column containerClass="gap-2">
        <Icon icon={COPY_STATUS_ICON[line.status]} size="lg" stroke="sm" />
        <Text variant="itemSm">{COPY_STATUS_ES[line.status]}</Text>
      </Column>
      <Column variant="actions" width="sm">
        {canOpenBook && (
          <Link href={`/catalog/${line.bookId}`} asChild>
            <Button variant="soft" icon={Eye} />
          </Link>
        )}
      </Column>
    </ListRow>
  );
}
