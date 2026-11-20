import { PropsWithChildren } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = { title?: string; variant?: "box" | "flat"; className?: string };

export function Card({
  title,
  variant = "box",
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <View
      className={cn(
        "gap-3",
        variant === "box" && "rounded-lg border border-fg1 bg-fg2 p-4",
        className,
      )}
    >
      {title && <Text variant="section">{title}</Text>}
      {children}
    </View>
  );
}
