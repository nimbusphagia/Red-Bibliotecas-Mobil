import { PropsWithChildren } from "react";
import { View } from "react-native";
import { Text } from "../Text";

type Props = { className?: string; title?: string };

export default function Card({
  title,
  className = "",
  children,
}: PropsWithChildren<Props>) {
  return (
    <View
      className={`rounded-[28] bg-foreground shadow-sm shadow-black/50 p-6 flex items-center gap-1 ${className}`}
    >
      {title && (
        <Text className="text-[21px] text-primary font-semibold">{title}</Text>
      )}
      {children}
    </View>
  );
}
