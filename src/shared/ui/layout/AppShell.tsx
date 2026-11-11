import { useLayoutMode } from "@/hooks/useLayoutMode";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sidebar } from "./Sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const insets = useSafeAreaInsets();
  const { isExpanded } = useLayoutMode();

  return (
    <View
      className="h-full flex flex-row flex-1 "
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Sidebar expanded={false} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
