import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = { title: string; lead?: ReactNode; className?: string };

export function FormSection({
  title,
  lead,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <View className={cn("gap-4", className)}>
      <View className="flex-row items-center justify-between">
        <Text variant="section">{title}</Text>
        {lead}
      </View>
      {children}
    </View>
  );
}

export const Divider = ({ vertical }: { vertical?: boolean }) => (
  <View className={vertical ? "w-px self-stretch bg-fg1" : "h-px bg-fg1"} />
);
