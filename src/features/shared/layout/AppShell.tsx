import { Sidebar } from "@/features/navigation/Sidebar/Sidebar";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row flex-1 "
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Sidebar />
      <View className="flex-1">{children}</View>
    </View>
  );
}
