import { SIDEBAR_WIDTH } from "@/features/navigation/Sidebar/Sidebar";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import {
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";

const EXPANDED_MIN_WIDTH = 800;

const ContentWidthContext = createContext<number | null>(null);

export function ContentArea({ children }: PropsWithChildren) {
  const { width: windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(windowWidth - SIDEBAR_WIDTH);
  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  return (
    <ContentWidthContext.Provider value={width}>
      <View className="flex-1" onLayout={onLayout}>
        {children}
      </View>
    </ContentWidthContext.Provider>
  );
}

export function useLayoutMode() {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = useContext(ContentWidthContext) ?? windowWidth;
  const isExpanded = contentWidth >= EXPANDED_MIN_WIDTH;
  return { isExpanded, isCompact: !isExpanded, contentWidth };
}
