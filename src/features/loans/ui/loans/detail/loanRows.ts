import { loanStateOf } from "@/features/loans/internal/loan/rules";
import type { LoanListItem } from "@/features/loans/internal/loan/types";
import type { DetailRow } from "@/features/shared/components";
import { formatDateES } from "@/features/shared/format/dates";
import { LOAN_STATE_ES } from "@/features/shared/format/translate";

export function loanDetailRows(
  loan: LoanListItem,
  { withState = true }: { withState?: boolean } = {},
): DetailRow[] {
  return [
    ...(withState
      ? [{ label: "Estado", content: LOAN_STATE_ES[loanStateOf(loan)] }]
      : []),
    { label: "Encargado", content: loan.loanedByUsername },
    { label: "Inicio", content: formatDateES(loan.createdAt) },
    {
      label: "Fecha de devolución",
      content: formatDateES(loan.expiresBy),
    },
    { label: "Notas", content: loan.notes ?? "---" },
  ];
}
