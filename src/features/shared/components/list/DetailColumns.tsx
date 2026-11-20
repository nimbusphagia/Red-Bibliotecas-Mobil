// shared/components/list/DetailColumns.tsx
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
    <View
      className={cn(
        "gap-6",
        isExpanded && "flex-row items-start",
        divided && "border-b border-fg1 pb-6",
      )}
    >
      {columns.map((c, i) => (
        <Fragment key={c.title}>
          {divided && isExpanded && i > 0 && <Divider vertical />}
          <Section
            title={c.title}
            lead={c.lead}
            expand={isExpanded && !c.fit}
            className={isExpanded && c.fit ? "w-60" : undefined}
          >
            <DetailRows rows={c.rows} variant={c.variant} columns={c.columns} />
          </Section>
        </Fragment>
      ))}
    </View>
  );
}
