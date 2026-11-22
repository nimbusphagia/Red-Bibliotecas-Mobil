import type { ShelfCopy } from "@/features/inventory/internal/shelf/types";
import {
  Button,
  Column,
  ListRow,
  StatusBadge,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { ArrowRightLeft, Eye } from "lucide-react-native";

type Props = { copy: ShelfCopy; onMove: () => void };

export default function ShelfCopyRow({ copy, onMove }: Props) {
  return (
    <ListRow compact>
      <Column variant="id" text={`#${copy.id}`} />
      <Column
        variant="subtitled"
        text={copy.bookTitle}
        subtitle1={copy.labelText ?? undefined}
      />
      <Column variant="actions">
        <StatusBadge
          text={COPY_STATUS_ES[copy.status]}
          variant={copy.status === "on_loan" ? "pending" : "active"}
        />
      </Column>
      <Column variant="actions" width="md">
        <Button variant="soft" icon={ArrowRightLeft} onPress={onMove} />
        <Link href={`/catalog/${copy.bookId}`} asChild>
          <Button variant="soft" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
