import type { ShelfCopy } from "@/features/inventory/internal/shelf/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye, SendToBack } from "lucide-react-native";
import { COPY_STATUS_ICON } from "../../copies/statusIcon";

type Props = { copy: ShelfCopy; onMove: () => void };

export default function ShelfCopyRow({ copy, onMove }: Props) {
  return (
    <ListRow>
      <Column variant="id" text={`#${copy.id}`} />
      <Column
        variant="subtitled"
        text={copy.bookTitle}
        subtitle1={copy.authors ?? undefined}
      />
      <Column text={copy.labelText ?? "---"} />
      <Column containerClass="gap-2">
        <Icon icon={COPY_STATUS_ICON[copy.status]} size="lg" stroke="sm" />
        <Text variant="itemSm">{COPY_STATUS_ES[copy.status]}</Text>
      </Column>
      <Column variant="actions" width="md">
        <Button variant="soft" icon={SendToBack} onPress={onMove} />
        <Link href={`/catalog/${copy.bookId}`} asChild>
          <Button variant="soft" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
