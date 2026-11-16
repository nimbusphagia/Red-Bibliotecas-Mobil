import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "./Text";

type SectionProps = {
  title: string;
  lead?: ReactNode;
  expand?: boolean;
  className?: string;
};

export function Section({
  title,
  lead,
  expand,
  className,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <View className={cn("gap-2", expand ? "flex-1" : "", className)}>
      <View className="flex-row items-center gap-2 ">
        <Text variant="h2" className="text-highlight">
          {title}
        </Text>
        {lead ?? null}
      </View>
      {children}
    </View>
  );
}
