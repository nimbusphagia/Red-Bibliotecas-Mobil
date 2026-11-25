import type { MovementLine } from "@/features/inventory/internal/movement/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { Link } from "expo-router";
import {
  ArrowUpRight,
  ChevronRight,
  RotateCcwClock,
} from "lucide-react-native";

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
            <Button
              variant="soft"
              icon={ChevronRight}
              className="bg-transparent"
            />
          </Link>
        )}
      </Column>
    </ListRow>
  );
}
