import { useWindowDimensions } from "react-native";

const EXPANDED_MIN_WIDTH = 900;

export function useLayoutMode() {
  const { width } = useWindowDimensions();
  return { isExpanded: width >= EXPANDED_MIN_WIDTH };
}
