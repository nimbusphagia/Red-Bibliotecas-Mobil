import { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "./Text";

type SectionProps = {
  title: string;
  lead?: ReactNode;
  expand?: boolean;
  className?: string;
  textClass?: string;
};

export function Section({
  title,
  lead,
  expand,
  className,
  textClass,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <View className={cn("gap-2", expand ? "flex-1" : "", className)}>
      <View className="min-h-10 flex-row items-center justify-between gap-2">
        <Text variant="section" className={textClass}>
          {title}
        </Text>
        {lead ?? null}
      </View>
      {children}
    </View>
  );
}
