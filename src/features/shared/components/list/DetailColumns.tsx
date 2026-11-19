import type { ReactNode } from "react";
import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn } from "../../theme";
import { Section } from "../base/Section";
import {
  DetailRows,
  type DetailRow,
  type DetailRowsVariant,
} from "./DetailRows";

export type DetailColumn = {
  title: string;
  rows: DetailRow[];
  lead?: ReactNode;
  variant?: DetailRowsVariant;
};

export function DetailColumns({ columns }: { columns: DetailColumn[] }) {
  const { isExpanded } = useLayoutMode();
  return (
    <View className={cn("gap-6", isExpanded && "flex-row")}>
      {columns.map(({ title, rows, lead, variant }) => (
        <Section key={title} title={title} lead={lead} expand={isExpanded}>
          <DetailRows rows={rows} variant={variant} />
        </Section>
      ))}
    </View>
  );
}
