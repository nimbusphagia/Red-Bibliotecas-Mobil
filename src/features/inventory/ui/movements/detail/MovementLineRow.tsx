import type { MovementLine } from "@/features/inventory/internal/movement/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { ArrowUpRight, Eye, RotateCcwClock } from "lucide-react-native";
import { COPY_STATUS_ICON } from "../../copies/statusIcon";

type Props = {
  line: MovementLine;
  canOpenBook: boolean;
  onRecover?: () => void;
};

export default function MovementLineRow({
  line,
  canOpenBook,
  onRecover,
}: Props) {
  // La recuperación que revirtió esta salida, o la salida que esta revierte.
  const linkedId = line.recoveryId ?? line.recoveredExitId;
  const actions = [onRecover, linkedId !== null, canOpenBook].filter(Boolean);

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
      <Column variant="actions" width={actions.length > 1 ? "md" : "sm"}>
        {onRecover && (
          <Button variant="soft" icon={RotateCcwClock} onPress={onRecover} />
        )}
        {linkedId !== null && (
          <Link href={`/stock/${linkedId}`} asChild>
            <Button variant="soft" icon={ArrowUpRight} />
          </Link>
        )}
        {canOpenBook && (
          <Link href={`/catalog/${line.bookId}`} asChild>
            <Button variant="soft" icon={Eye} />
          </Link>
        )}
      </Column>
    </ListRow>
  );
}
