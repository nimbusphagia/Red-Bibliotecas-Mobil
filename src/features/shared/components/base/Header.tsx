import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { Text } from "./Text";

type Props = { title?: string; lead?: ReactNode };

export function PageHeader({
  title = "",
  lead,
  children,
}: PropsWithChildren<Props>) {
  return (
    <View className="flex-row items-center gap-5 px-4">
      <Text className="text-highlight text-[24px] font-sans-semibold">
        {title}
      </Text>
      {lead}
      <View className="flex-1 flex-row items-center justify-end gap-5">
        {children}
      </View>
    </View>
  );
}
