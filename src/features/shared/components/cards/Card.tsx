import { PropsWithChildren } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = { className?: string; title?: string };

export function Card({ title, className, children }: PropsWithChildren<Props>) {
  return (
    <View
      className={cn(
        "gap-3 rounded-lg border border-fg1 bg-fg2 px-4 py-4",
        className,
      )}
    >
      {title && <Text variant="section">{title}</Text>}
      {children}
    </View>
  );
}
