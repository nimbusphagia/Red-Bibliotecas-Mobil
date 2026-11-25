import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { cn, ToneContext, tones } from "../theme";

export function Screen({ children }: PropsWithChildren) {
  return (
    <ToneContext.Provider value="canvas">
      <View
        className={cn("flex-1 gap-4 px-6 pb-4 pl-2 pt-2", tones.canvas.surface)}
      >
        {children}
      </View>
    </ToneContext.Provider>
  );
}

export function ScreenBody({
  form,
  onEndReached,
  children,
}: PropsWithChildren<{
  form?: boolean;
  /** Al acercarse al final (para cargar la siguiente página). */
  onEndReached?: () => void;
}>) {
  return (
    <ScrollView
      onScroll={
        onEndReached &&
        (({
          nativeEvent: { contentOffset, contentSize, layoutMeasurement },
        }) => {
          const left =
            contentSize.height - contentOffset.y - layoutMeasurement.height;
          if (left < layoutMeasurement.height / 2) onEndReached();
        })
      }
      scrollEventThrottle={100}
      className="flex-1"
      contentContainerClassName="gap-6 pb-4"
      keyboardShouldPersistTaps={form ? "handled" : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
