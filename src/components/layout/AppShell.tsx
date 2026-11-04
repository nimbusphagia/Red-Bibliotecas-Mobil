import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayoutMode } from "@/hooks/useLayoutMode";
import { Sidebar } from "./Sidebar";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const insets = useSafeAreaInsets();
  const { isExpanded } = useLayoutMode();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Sidebar expanded={isExpanded} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
