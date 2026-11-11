import { Button, Text } from "@/shared/ui/components";
import { colors } from "@/shared/ui/utils";
import { BookDown, BookUp, NotebookPen } from "lucide-react-native";
import { PropsWithChildren, ReactNode } from "react";
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
      <View className="flex flex-row gap-5">{children} </View>
    </View>
  );
}
