import { LoanListItem } from "@/features/loans/internal/loan/types";
import { Text } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { ClockExclamationPoint } from "lucide-react-native";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { View } from "react-native";

type Props = {
  loan: LoanListItem;
  index: number;
};

export default function LoanRow({ loan, index }: Props) {
  const returned = loan.lineCount - loan.openCount;
  const alt = index % 2 === 1;

  const textColor = "text-highlight";
  const iconColor = colors.highlight;

  return (
    <View
      className={`flex flex-row items-center px-2 py-2 ${alt ? "bg-fg1" : ""}`}
    >
      <Text className={`flex-1 ${textColor}`}>{loan.visitorName}</Text>
      <View className="flex-1 flex flex-row items-center gap-10">
        <Text className={textColor}>{formatISO(loan.expiresBy)}</Text>
        {loan.overdue && (
          <ClockExclamationPoint
            size={16}
            color={iconColor}
            strokeWidth={2.5}
          />
        )}
      </View>
      <Text className={`flex-1 ${textColor}`}>
        {formatDate(loan.createdAt)}
      </Text>
      <Text className={`flex-1 text-center ${textColor}`}>{returned}</Text>
      <Text className={`flex-1 text-center ${textColor}`}>
        {loan.lineCount}
      </Text>
    </View>
  );
}
