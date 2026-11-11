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
      className={`rounded-[30px] bg-foreground shadow-sm shadow-black/50 py-4 px-5 flex items-center gap-1 ${className}`}
    >
      {title && (
        <Text className="text-[20px] text-highlight font-semibold">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
