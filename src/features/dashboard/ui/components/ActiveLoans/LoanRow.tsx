import { View } from "react-native";
import { ClockExclamationPoint } from "lucide-react-native";
import { Text } from "@/ui/components";
import { colors } from "@/ui/utils";
import { LoanListItem } from "@/features/loans/loan/types";

type Props = {
  loan: LoanListItem;
  index: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

const formatISO = (iso: string) => iso.split("-").reverse().join("/");

const formatDate = (d: Date) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

export default function LoanRow({ loan, index }: Props) {
  const returned = loan.lineCount - loan.openCount;
  const alt = index % 2 === 1;

  const textColor = alt ? "font-bold text-background" : "text-highlight";
  const iconColor = alt ? colors.background : colors.highlight;

  return (
    <View
      className={`flex flex-row items-center px-2 py-2 ${
        alt ? "bg-primary" : ""
      }`}
    >
      <Text className={`flex-1 ${textColor}`}>{loan.visitorName}</Text>
      <View className="flex-1 flex flex-row items-center justify-between pr-[44]">
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
