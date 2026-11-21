import { Fragment, type ReactNode } from "react";
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
  columns?: 1 | 2;
  fit?: boolean;
};

type Props = { columns: DetailColumn[]; divided?: boolean };

export function DetailColumns({ columns }: Props) {
  const { isExpanded } = useLayoutMode();
  return (
    <View className={cn("gap-4", isExpanded && "flex-row items-start")}>
      {columns.map((c) => (
        <Fragment key={c.title}>
          <Section
            title={c.title}
            lead={c.lead}
            expand={isExpanded && !c.fit}
            className={cn(
              isExpanded && c.fit ? "w-60" : undefined,
              c.variant === "box" ? "bg-white" : "bg-white",
              "rounded-xl px-6 py-4",
            )}
          >
            <DetailRows rows={c.rows} variant={c.variant} columns={c.columns} />
          </Section>
        </Fragment>
      ))}
    </View>
  );
}
