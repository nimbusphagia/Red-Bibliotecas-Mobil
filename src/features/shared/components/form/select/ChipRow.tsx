import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";
import { FADE_IN } from "../../base/motion";
import { Chip } from "./Chip";

const GAP = 8;

/** Fila de chips (pill) en una sola línea; los que no entran se resumen en "+N". */
export function ChipRow({ labels }: { labels: string[] }) {
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
    labels.every((_, i) => widths[i] !== undefined);

  const total = (n: number) =>
    widths.slice(0, n).reduce((a, w) => a + w, 0) + GAP * Math.max(n - 1, 0);

  let visible = labels.length;
  if (measured && total(labels.length) > width) {
    visible = 0;
    while (
      visible < labels.length &&
      total(visible + 1) + GAP + moreWidth <= width
    )
      visible++;
  }
  const hidden = labels.length - visible;

  return (
    <View
      className="flex-row overflow-hidden"
      style={{ gap: GAP }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View
        className="absolute flex-row opacity-0"
        style={{ gap: GAP }}
        pointerEvents="none"
      >
        {labels.map((label, i) => (
          <View key={i} onLayout={measure(i)}>
            <Chip shape="pill" label={label} />
          </View>
        ))}
        <View onLayout={(e) => setMoreWidth(e.nativeEvent.layout.width)}>
          <Chip shape="circle" label={`+${labels.length}`} />
        </View>
      </View>
      {measured && (
        <Animated.View
          entering={FADE_IN}
          className="flex-row"
          style={{ gap: GAP }}
        >
          {labels.slice(0, visible).map((label, i) => (
            <Chip key={i} shape="pill" label={label} />
          ))}
          {hidden > 0 && <Chip shape="circle" label={`+${hidden}`} />}
        </Animated.View>
      )}
    </View>
  );
}
