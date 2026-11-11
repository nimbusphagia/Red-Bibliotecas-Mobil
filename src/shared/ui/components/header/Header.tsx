import { Text } from "@/shared/ui/components";
import { PropsWithChildren } from "react";
import { View } from "react-native";

type Props = {
  title?: string;
};
export default function Header({
  children,
  title = "",
}: PropsWithChildren<Props>) {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text
        className="text-highlight"
        style={{ fontSize: 24, fontWeight: 600 }}
      >
        {title}
      </Text>
      <View className="flex flex-row items-center gap-5">{children}</View>
    </View>
  );
}
