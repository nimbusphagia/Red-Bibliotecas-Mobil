import { PropsWithChildren } from "react";
import { View } from "react-native";
import { Text } from "../Text";
import { cn } from "../../theme";

type Props = { className?: string; title?: string };

export default function Card({
  title,
  className = "",
  children,
}: PropsWithChildren<Props>) {
  return (
    <View
      className={cn(
        "rounded-[30px] bg-foreground/70 py-4 px-5 items-center gap-1",
        className,
      )}
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
