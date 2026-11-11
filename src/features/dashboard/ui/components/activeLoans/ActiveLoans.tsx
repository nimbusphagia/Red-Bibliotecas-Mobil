import { LoanListItem } from "@/features/loans/internal/loan/types";
import { Text } from "@/shared/ui/components";
import { View } from "react-native";
import LoanRow from "./LoanRow";

type Props = {
  loans: LoanListItem[];
};

const MOCK_LOANS: LoanListItem[] = [
  {
    id: 1,
    createdAt: new Date(2026, 10, 1),
    loanedById: 1,
    loanedToId: 1,
    expiresBy: "2026-11-15",
    notes: null,
    visitorName: "María Fernández",
    loanedByUsername: "admin",
    lineCount: 3,
    openCount: 3,
    overdue: true,
  },
  {
    id: 2,
    createdAt: new Date(2026, 9, 20),
    loanedById: 1,
    loanedToId: 2,
    expiresBy: "2026-11-03",
    notes: null,
    visitorName: "Carlos Ramírez",
    loanedByUsername: "admin",
    lineCount: 2,
    openCount: 1,
    overdue: true,
  },
  {
    id: 3,
    createdAt: new Date(2026, 10, 5),
    loanedById: 2,
    loanedToId: 3,
    expiresBy: "2026-11-19",
    notes: null,
    visitorName: "Lucía Torres",
    loanedByUsername: "biblio1",
    lineCount: 5,
    openCount: 4,
    overdue: true,
  },
  {
    id: 4,
    createdAt: new Date(2026, 9, 12),
    loanedById: 2,
    loanedToId: 4,
    expiresBy: "2026-10-26",
    notes: null,
    visitorName: "Jorge Vásquez",
    loanedByUsername: "biblio1",
    lineCount: 1,
    openCount: 1,
    overdue: false,
  },
  {
    id: 5,
    createdAt: new Date(2026, 10, 9),
    loanedById: 1,
    loanedToId: 5,
    expiresBy: "2026-11-23",
    notes: null,
    visitorName: "Ana Paredes",
    loanedByUsername: "admin",
    lineCount: 4,
    openCount: 2,
    overdue: false,
  },
  {
    id: 6,
    createdAt: new Date(2026, 9, 12),
    loanedById: 2,
    loanedToId: 4,
    expiresBy: "2026-10-26",
    notes: null,
    visitorName: "Jorge Vásquez",
    loanedByUsername: "biblio1",
    lineCount: 1,
    openCount: 1,
    overdue: false,
  },
];

export default function ActiveLoans({ loans = [] }: Props) {
  const data = loans.length > 0 ? loans : MOCK_LOANS;
  const headerClass = "flex-1 font-semibold text-white text-[16px]";

  return (
    <View className="flex flex-col flex-1 gap-5 px-4 ">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-[18px] text-highlight font-bold">
          Prestamos Pendientes
        </Text>
      </View>
      <View className="border border-primary rounded-md">
        <View className="flex flex-row items-center px-2 py-2 bg-highlight">
          <Text className={`${headerClass}`}>Préstamo</Text>
          <Text className={`${headerClass}`}>Vencimiento</Text>
          <Text className={`${headerClass}`}>Emisión</Text>
          <Text className={`${headerClass} text-center`}>Devueltos</Text>
          <Text className={`${headerClass} text-center`}>Total</Text>
        </View>
        {data.map((l, i) => (
          <LoanRow key={l.id} loan={l} index={i} />
        ))}
      </View>
    </View>
  );
}
