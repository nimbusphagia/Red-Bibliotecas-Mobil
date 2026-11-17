import type { LoanLine } from "@/features/loans/internal/loan/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatDate } from "@/features/shared/format/dates";
import { OUTCOME_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Book, BookCheck } from "lucide-react-native";
import { View } from "react-native";

export default function LoanLines({ lines }: { lines: LoanLine[] }) {
  return (
    <View className="gap-2 ">
      {lines.map((l) => (
        <PillRow key={l.id} className="py-1">
          <Column text={`#${l.copyId}`} variant="id" />
          <Column
            variant="subtitled"
            text={l.bookTitle}
            subtitle1={l.labelText ?? undefined}
          />
          <Column
            variant="subtitled"
            containerClass="justify-center "
            subtitle1={
              (l.resolvedAt && ` · ${formatDate(l.resolvedAt)}`) ?? undefined
            }
          >
            <StatusBadge
              text={l.outcome ? OUTCOME_ES[l.outcome] : "Pendiente"}
              variant={l.outcome ? "active" : "pending"}
            />
          </Column>
          <Column variant="actions" expand={false}>
            <Link href={`/catalog/${l.bookId}`} asChild>
              <Button
                variant="secondary"
                icon={<Book size={16} color={colors.highlight} />}
              />
            </Link>
            {!l.outcome && (
              <Button
                variant="highlight"
                icon={<BookCheck size={16} color={colors.bg} />}
              />
            )}
          </Column>
        </PillRow>
      ))}
    </View>
  );
}
