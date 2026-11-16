import type { LoanListItem } from "@/features/loans/internal/loan/types";
import { Button, PillRow, Text } from "@/features/shared/components";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookCheck, ClockAlert, Eye } from "lucide-react-native";
import { View } from "react-native";

type Props = { loan: LoanListItem };

export default function LoanRow({ loan }: Props) {
  const colClass = "flex-1 justify-center gap-[1px]";
  return (
    <PillRow>
      <View className={colClass}>
        <Text variant="h3" className="text-highlight">
          {loan.visitorName}
        </Text>
        <Text variant="subtitle">Prestado el {formatDate(loan.createdAt)}</Text>
      </View>
      <View className={colClass}>
        <View className="flex-row items-center gap-3">
          <Text variant="h3" className="font-semibold text-[15px]">
            {formatISO(loan.expiresBy)}
          </Text>
          {loan.overdue && (
            <ClockAlert size={16} color={colors.highlight} strokeWidth={2.5} />
          )}
        </View>
        <Text variant="subtitle">Vencimiento</Text>
      </View>
      <View className={`${colClass} items-center`}>
        <Text variant="h3" className="font-semibold text-[14px]">
          {loan.lineCount - loan.openCount} de {loan.lineCount}
        </Text>
        <Text variant="subtitle">devueltos</Text>
      </View>
      <View className="flex-row items-center gap-6">
        <Link href={`/loans/${loan.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={18} color={colors.highlight} />}
          />
        </Link>
        {loan.openCount > 0 && (
          <Button
            variant="highlight"
            icon={<BookCheck size={18} color={colors.bg} />}
          />
        )}
      </View>
    </PillRow>
  );
}
