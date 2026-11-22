import { cn, useTone } from "../../theme";
import { Surface } from "../base/Surface";
import { Text } from "../base/Text";

export type Stat = {
  name: string;
  numberData: number | string;
};

type Props = { stat: Stat; highlight?: boolean };

export function StatTile({ stat, highlight }: Props) {
  const t = useTone();
  const label = highlight && t.accent.label;
  return (
    <Surface
      inset
      className={cn(
        "min-w-[110px] items-start gap-1 px-4 py-2",
        highlight && t.accent.box,
      )}
    >
      <Text variant="display" className={cn(label)}>
        {stat.numberData}
      </Text>
      <Text variant="caption" className={cn(label)}>
        {stat.name}
      </Text>
    </Surface>
  );
}
