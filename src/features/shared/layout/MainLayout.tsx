import { View } from "react-native";
import { Text } from "../components";

type Props = {
  title?: string;
  children?: React.ReactNode;
};
export function MainLayout({ title, children }: Props) {
  return (
    <View className="flex-1 pl-[6] pr-[20] pt-[10] pb-[8] gap-[8] ">
      {title && <Text className="font-sans-semibold text-[24px]">{title}</Text>}
      {children}
    </View>
  );
}
