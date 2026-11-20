import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { cn } from "../../../theme";

export function ChipGroup({
  center,
  children,
}: PropsWithChildren<{ center?: boolean }>) {
  return (
    <View
      className={cn(
        "flex-row flex-wrap gap-x-3 gap-y-4",
        center && "justify-center",
      )}
    >
      {children}
    </View>
  );
}
