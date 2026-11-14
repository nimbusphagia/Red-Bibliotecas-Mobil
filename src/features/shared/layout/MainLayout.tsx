import { View } from "react-native";
import { Text } from "../components";

type Props = {
  title?: string;
  children?: React.ReactNode;
};
export function MainLayout({ title, children }: Props) {
  return (
    <View className="flex-1 px-[20] pt-[12] pb-[4] gap-[12] ">
      {title && <Text className="font-sans-semibold text-[24px]">{title}</Text>}
      {children}
    </View>
  );
}
