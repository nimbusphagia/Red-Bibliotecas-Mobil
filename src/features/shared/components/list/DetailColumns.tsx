import { Fragment, type ReactNode } from "react";
import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn } from "../../theme";
import { Section } from "../base/Section";
import { Divider } from "../form/FormSection";
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

export function DetailColumns({ columns, divided }: Props) {
  const { isExpanded } = useLayoutMode();
  return (
    <View className={cn("gap-6", isExpanded && "flex-row items-start")}>
      {columns.map((c) => (
        <Fragment key={c.title}>
          <Section
            title={c.title}
            lead={c.lead}
            expand={isExpanded && !c.fit}
            textClass={c.variant === "box" ? "text-white" : ""}
            className={cn(
              isExpanded && c.fit ? "w-60" : undefined,
              c.variant === "box" ? "bg-dark2" : "bg-white",
              "rounded-xl p-4",
            )}
          >
            <DetailRows rows={c.rows} variant={c.variant} columns={c.columns} />
          </Section>
        </Fragment>
      ))}
    </View>
  );
}
