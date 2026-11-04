import { useWindowDimensions } from "react-native";

const EXPANDED_MIN_WIDTH = 900;

export function useLayoutMode() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isLandscape: width > height,
    isExpanded: width >= EXPANDED_MIN_WIDTH,
  };
}
