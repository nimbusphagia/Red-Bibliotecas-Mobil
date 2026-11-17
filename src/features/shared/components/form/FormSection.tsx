import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { cn } from "../../theme";
import { Text } from "../base/Text";

type Props = { title: string; className?: string };

export function FormSection({
  title,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <View className={cn("gap-4", className)}>
      <Text variant="h1" className="font-sans-medium text-highlight">
        {title}
      </Text>
      {children}
    </View>
  );
}

export const Divider = ({ vertical }: { vertical?: boolean }) => (
  <View className={vertical ? "w-px self-stretch bg-fg1" : "h-px bg-fg1"} />
);
