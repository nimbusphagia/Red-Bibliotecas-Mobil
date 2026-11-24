import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";
import { cn, type AccentLevel } from "../../../theme";
import { FADE_IN } from "../../base/motion";
import { Chip } from "./Chip";

const GAP = 8;

export type ChipItem = { label: string; accent?: AccentLevel };

/** Fila de chips (pill) en una sola línea; los que no entran se resumen en "+N". */
export function ChipRow({ chips, end }: { chips: ChipItem[]; end?: boolean }) {
  const [width, setWidth] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const [moreWidth, setMoreWidth] = useState(0);

  const measure = (i: number) => (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidths((prev) => {
      const next = [...prev];
      next[i] = w;
      return next;
    });
  };

  const measured =
    width > 0 &&
    moreWidth > 0 &&
    chips.every((_, i) => widths[i] !== undefined);

  const total = (n: number) =>
    widths.slice(0, n).reduce((a, w) => a + w, 0) + GAP * Math.max(n - 1, 0);

  let visible = chips.length;
  if (measured && total(chips.length) > width) {
    visible = 0;
    while (
      visible < chips.length &&
      total(visible + 1) + GAP + moreWidth <= width
    )
      visible++;
  }
  const hidden = chips.length - visible;

  return (
    <View
      className={cn("flex-row overflow-hidden", end && "justify-end")}
      style={{ gap: GAP }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View
        className="absolute flex-row opacity-0"
        style={{ gap: GAP }}
        pointerEvents="none"
      >
        {chips.map(({ label, accent }, i) => (
          <View key={i} onLayout={measure(i)}>
            <Chip shape="pill" label={label} accent={accent} />
          </View>
        ))}
        <View onLayout={(e) => setMoreWidth(e.nativeEvent.layout.width)}>
          <Chip shape="circle" label={`+${chips.length}`} />
        </View>
      </View>
      {measured && (
        <Animated.View
          entering={FADE_IN}
          className="flex-row"
          style={{ gap: GAP }}
        >
          {chips.slice(0, visible).map(({ label, accent }, i) => (
            <Chip key={i} shape="pill" label={label} accent={accent} />
          ))}
          {hidden > 0 && <Chip shape="circle" label={`+${hidden}`} />}
        </Animated.View>
      )}
    </View>
  );
}
