import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";

export function Screen({ children }: PropsWithChildren) {
  return <View className="flex-1 gap-4 px-4 pt-4">{children}</View>;
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
