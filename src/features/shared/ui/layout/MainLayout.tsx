import { View, Text } from "react-native";

type Props = {
  title?: string;
  children?: React.ReactNode;
};

export function MainLayout({ title, children }: Props) {
  return (
    <View className=" flex-1 px-[24] pt-[12]  pb-[4] gap-[12] ">
      {title && (
        <Text style={{ fontSize: 24, fontWeight: "600" }}>{title}</Text>
      )}
      {children}
    </View>
  );
}
