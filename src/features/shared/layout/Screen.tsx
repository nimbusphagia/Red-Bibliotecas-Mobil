import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { cn, ToneContext, tones } from "../theme";

export function Screen({ children }: PropsWithChildren) {
  return (
    <ToneContext.Provider value="canvas">
      <View
        className={cn(
          "flex-1 gap-4 px-6 pb-4 pl-2 pt-2",
          tones.canvas.surface,
        )}
      >
        {children}
      </View>
    </ToneContext.Provider>
  );
}

export function ScreenBody({
  form,
  children,
}: PropsWithChildren<{ form?: boolean }>) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-6 pb-4"
      keyboardShouldPersistTaps={form ? "handled" : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
