import { Text } from "./Text";
import { PropsWithChildren } from "react";
import { View } from "react-native";

type Props = {
  title?: string;
};
export function PageHeader({ children, title = "" }: PropsWithChildren<Props>) {
  return (
    <View className="flex-row justify-between items-center px-4">
      <Text
        className="text-highlight"
        style={{ fontSize: 24, fontWeight: 600 }}
      >
        {title}
      </Text>
      <View className="flex-1 flex-row items-center gap-5">{children}</View>
    </View>
  );
}
