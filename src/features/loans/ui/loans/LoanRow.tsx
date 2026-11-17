import type { LoanListItem } from "@/features/loans/internal/loan/types";
import { Button, PillRow, Text } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { formatISO } from "@/features/shared/format/dates";
import { cn, colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, ClockAlert, Eye } from "lucide-react-native";
import { View } from "react-native";

type Props = { loan: LoanListItem };

export default function LoanRow({ loan }: Props) {
  const colClass = "flex-1 justify-center items-center gap-[1px]";
  return (
    <PillRow className="gap-10">
      <View className={cn(colClass, "max-w-[50]")}>
        <Text variant="subtitle" className="text-highlight">
          #{loan.id}
        </Text>
      </View>

      <View className={colClass}>
        <Text variant="h3">{loan.visitorName}</Text>
      </View>
      <View className={colClass}>
        <StatusBadge
          text={loan.overdue ? "Vencido" : "Activo"}
          variant={"pending"}
        />
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
            variant="secondary"
            icon={<BookDown size={18} color={colors.highlight} />}
          />
        )}
      </View>
    </PillRow>
  );
}
