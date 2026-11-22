import { PropsWithChildren } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Surface } from "../base/Surface";
import { Text } from "../base/Text";

type Props = { title?: string; variant?: "box" | "flat"; className?: string };

/** box: contenedor light1. flat: sin fondo, toma el tono de donde esté. */
export function Card({
  title,
  variant = "box",
  className,
  children,
}: PropsWithChildren<Props>) {
  const content = (
    <>
      {title && <Text variant="section">{title}</Text>}
      {children}
    </>
  );
  return variant === "box" ? (
    <Surface tone="light" className={cn("gap-3 rounded-lg p-4", className)}>
      {content}
    </Surface>
  ) : (
    <View className={cn("gap-3", className)}>{content}</View>
  );
}
