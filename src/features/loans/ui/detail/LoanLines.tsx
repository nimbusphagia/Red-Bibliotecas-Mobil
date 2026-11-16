import type { LoanLine } from "@/features/loans/internal/loan/types";
import {
  Button,
  PillRow,
  PillRowColumn,
  Text,
} from "@/features/shared/components";
import { formatDate } from "@/features/shared/format/dates";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Book, BookCheck } from "lucide-react-native";
import { View } from "react-native";

export default function LoanLines({ lines }: { lines: LoanLine[] }) {
  return (
    <View className="gap-4 py-3">
      {lines.map((l) => (
        <PillRow key={l.id} className="items-center py-2">
          <PillRowColumn
            variant="highlight"
            title={l.labelText ?? `#${l.copyId}`}
          />
          <View className="flex-1 justify-center">
            <Text variant="h3" numberOfLines={1}>
              {l.bookTitle}
            </Text>
            <Text variant="subtitle">
              Ejemplar {l.copyNumber}
              {l.resolvedAt && ` · ${formatDate(l.resolvedAt)}`}
            </Text>
          </View>
          <PillRowColumn
            variant={l.outcome ? "badge" : "text"}
            title={l.outcome ? OUTCOME_ES[l.outcome] : "Pendiente"}
          />
          <View className="flex-row items-center gap-4">
            <Link href={`/catalog/${l.bookId}`} asChild>
              <Button
                variant="secondary"
                icon={<Book size={18} color={colors.highlight} />}
              />
            </Link>
            {!l.outcome && (
              <Button
                variant="highlight"
                icon={<BookCheck size={18} color={colors.bg} />}
              />
            )}
          </View>
        </PillRow>
      ))}
    </View>
  );
}
