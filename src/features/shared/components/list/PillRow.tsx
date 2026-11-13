import { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";

type Props = {
  cols: ReactNode[];
  className?: string;
};
export default function PillRow({ cols, className }: Props) {
  return (
    <View
      className={cn(
        "border border-foreground flex-row justify-between gap-5 py-3 px-7 rounded-full bg-foreground/20",
        className,
      )}
    >
      {cols.map((c, i) => (
        <View key={i} className="flex-1 justify-center gap-[1px]">
          {c}
        </View>
      ))}
    </View>
  );
}
