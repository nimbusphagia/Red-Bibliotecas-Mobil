import { Fragment, type ReactNode } from "react";
import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn, type Tone } from "../../theme";
import { Panel } from "../base/Surface";
import {
  DetailRows,
  type DetailRow,
  type DetailRowsVariant,
} from "./DetailRows";

export type DetailColumn = {
  title: string;
  rows: DetailRow[];
  lead?: ReactNode;
  tone?: Tone;
  variant?: DetailRowsVariant;
  columns?: 1 | 2;
  fit?: boolean;
};

type Props = { columns: DetailColumn[] };

export function DetailColumns({ columns }: Props) {
  const { isExpanded } = useLayoutMode();
  return (
    <View className={cn("gap-4", isExpanded && "flex-row items-start")}>
      {columns.map((c) => (
        <Fragment key={c.title}>
          <Panel
            title={c.title}
            lead={c.lead}
            tone={c.tone}
            className={cn(isExpanded && (c.fit ? "w-60" : "flex-1"))}
          >
            <DetailRows rows={c.rows} variant={c.variant} columns={c.columns} />
          </Panel>
        </Fragment>
      ))}
    </View>
  );
}
